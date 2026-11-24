// Pure cookbook queries and validation; no browser dependencies.
import { RECIPES, totalMinutes, handsMinutes } from './kitchen-data.ts';
import type { Recipe } from './kitchen-types.ts';
import type { CookbookInfo, CookbookRecipe } from './cookbook-recipes.ts';
export const BOOK_KEY = 'homecraft.cookbook.favourites.v1';
export const BOOK_CATEGORIES = ['Obiady','Zupy','Śniadania','Przekąski','Napoje','Desery','Ciasta','Chleby','Bułki','Wypieki'];
export const BOOK_CUISINES = ['Polska','Azjatycka','Śródziemnomorska','Międzynarodowa','Włoska','Francuska','Meksykańska','Japońska','Tajska','Indyjska','Grecka','Koreańska','Turecka','Hiszpańska','Amerykańska'];
export const BOOK_DIETS = ['Wysokobiałkowa','Niskowęglowodanowa','Śródziemnomorska','Wegetariańska','Wegańska','Bezglutenowa'];
export const BOOK_DEVICES = ['Air Fryer','Thermomix','Bez urządzenia','Piekarnik'];
const panko: CookbookInfo = {cuisine:'Międzynarodowa',category:'Obiady',diets:['Wysokobiałkowa'],devices:['Air Fryer'],tested:false,allergens:['gluten','jaja','mleko','gorczyca'],sources:['https://cosori.com/pages/air-fryer-recipes'],nutrition:[
 {n:'Pierś z kurczaka',grams:500,kcal100:120},{n:'Jajka',grams:110,kcal100:143},{n:'Panko',grams:80,kcal100:350},{n:'Mąka',grams:30,kcal100:364},{n:'Przyprawy',grams:5,kcal100:100},{n:'Ziemniaki',grams:700,kcal100:77},{n:'Olej (łyżka i spray)',grams:20,kcal100:884},{n:'Sałata',grams:150,kcal100:15},{n:'Pomidor',grams:170,kcal100:18},{n:'Ogórek',grams:150,kcal100:15},{n:'Oliwa',grams:20,kcal100:884},{n:'Sok z cytryny',grams:25,kcal100:22},{n:'Miód',grams:7,kcal100:304},{n:'Musztarda',grams:5,kcal100:66},
]};
export const bookInfo = (recipe: Recipe): CookbookInfo => 'book' in recipe ? (recipe as CookbookRecipe).book : panko;
export const recipeKcal = (recipe: Recipe) => Math.round(bookInfo(recipe).nutrition.reduce((sum,i)=>sum+i.grams*i.kcal100/100,0)/recipe.servings);
export const normalizeBook = (s: string) => s.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
export type RecipeFeedback = {rating:number; count:number; last:number};
export type FeedbackMap = Record<string,RecipeFeedback>;
export function healthLevel(recipe:Recipe){
 const info=bookInfo(recipe), names=info.nutrition.map(i=>i.n.toLowerCase());
 const plants=info.nutrition.filter((_,i)=>/broku|szpinak|pomidor|papryk|cukini|kalafior|marchew|warzyw|sałat|kapust|fasol|soczew|ciecier|komos|owsian|jabł|malin|jagod|awokado|ogór|grosz|bakłaż|szparag/.test(names[i])).reduce((n,i)=>n+i.grams,0);
 const total=info.nutrition.reduce((n,i)=>n+i.grams,0);
 return !total?'unknown':['Desery','Ciasta'].includes(info.category)||names.some(n=>/cukier|syrop|czekolad|boczek|kiełbas|śmietan|mascarpone/.test(n))?'occasional':plants/total>=.35?'green':'moderate';
}
export const healthRank=(r:Recipe)=>({green:3,moderate:2,occasional:1,unknown:0}[healthLevel(r)]);
export const difficulty=(r:Recipe)=>handsMinutes(r)<=15&&r.tasks.length<=4?1:handsMinutes(r)<=40&&r.tasks.length<=7?2:3;
export const difficultyLabel=(r:Recipe)=>['','Łatwy','Średni','Zaawansowany'][difficulty(r)];
export type BookSort = 'name' | 'time' | 'kcal' | 'kcal-desc' | 'rating' | 'health' | 'difficulty' | 'cooked' | 'recent';
export interface BookFilters { query: string; category: string; cuisine: string; diet: string; device: string; quick: boolean; favouritesOnly: boolean; sort: BookSort; ratedOnly?:boolean; difficulty?:string; health?:string }
export const EMPTY_FILTERS: BookFilters = {query:'',category:'',cuisine:'',diet:'',device:'',quick:false,favouritesOnly:false,sort:'name',ratedOnly:false,difficulty:'',health:''};
export function filterRecipes(filters: BookFilters, favourites: readonly string[], recipes: readonly Recipe[] = RECIPES, feedback:FeedbackMap = {}): Recipe[] {
 const words = normalizeBook(filters.query.trim()).split(/\s+/).filter(Boolean);
 const fav = new Set(favourites);
 return recipes.filter(r=>{
  const meta=bookInfo(r), hay=normalizeBook([r.name,meta.cuisine,meta.category,...r.ingredients.map(i=>i.n)].join(' '));
  return words.every(w=>hay.includes(w)) && (!filters.category||meta.category===filters.category) && (!filters.cuisine||meta.cuisine===filters.cuisine) && (!filters.diet||meta.diets.includes(filters.diet as never)) && (!filters.device||meta.devices.includes(filters.device as never)) && (!filters.quick||totalMinutes(r)<=30) && (!filters.favouritesOnly||fav.has(r.id)) && (!filters.ratedOnly||(feedback[r.id]?.rating||0)>0) && (!filters.difficulty||String(difficulty(r))===filters.difficulty) && (!filters.health||healthLevel(r)===filters.health);
 }).sort((a,b)=>{
  const diff=filters.sort==='rating'?(feedback[b.id]?.rating||0)-(feedback[a.id]?.rating||0):filters.sort==='health'?healthRank(b)-healthRank(a):filters.sort==='difficulty'?difficulty(a)-difficulty(b):filters.sort==='cooked'?(feedback[b.id]?.count||0)-(feedback[a.id]?.count||0):filters.sort==='recent'?(feedback[b.id]?.last||0)-(feedback[a.id]?.last||0):filters.sort==='time'?totalMinutes(a)-totalMinutes(b):filters.sort==='kcal'?recipeKcal(a)-recipeKcal(b):filters.sort==='kcal-desc'?recipeKcal(b)-recipeKcal(a):0;
  return diff||a.name.localeCompare(b.name,'pl')||a.id.localeCompare(b.id);
 });
}
export function parseFavourites(raw: string | null, known = new Set(RECIPES.map(r=>r.id))): string[] {
 try { const value:unknown=JSON.parse(raw||'null');
  if(!value||typeof value!=='object'||!('v' in value)||value.v!==1||!('ids' in value)||!Array.isArray(value.ids))return [];
  return [...new Set(value.ids.filter((id:unknown):id is string=>typeof id==='string'&&known.has(id)))];
 }catch{return [];}
}
