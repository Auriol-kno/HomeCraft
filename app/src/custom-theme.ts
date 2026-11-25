export const CUSTOM_THEME_KEY='homecraft.customThemes.v1';
export interface CustomTheme {id:string;name:string;button:string;accent:string}
export interface CustomThemeStore {v:1;active:string|null;themes:CustomTheme[]}
const blank=():CustomThemeStore=>({v:1,active:null,themes:[]});
const hex=(value:unknown):value is string=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
export function parseCustomThemes(raw:string|null):CustomThemeStore{
 try{const value:unknown=JSON.parse(raw||'null');if(!value||typeof value!=='object'||!('v' in value)||value.v!==1||!('themes' in value)||!Array.isArray(value.themes))return blank();
  const themes:CustomTheme[]=[];for(const item of value.themes){if(!item||typeof item!=='object')continue;const x=item as Record<string,unknown>;if(typeof x.id!=='string'||!/^[a-z0-9-]{1,50}$/.test(x.id)||typeof x.name!=='string'||!x.name.trim()||x.name.trim().length>30||!hex(x.button)||!hex(x.accent)||themes.some(t=>t.id===x.id))continue;themes.push({id:x.id,name:x.name.trim(),button:x.button.toLowerCase(),accent:x.accent.toLowerCase()});}
  const active='active' in value&&typeof value.active==='string'&&themes.some(t=>t.id===value.active)?value.active:null;return {v:1,active,themes};
 }catch{return blank();}
}
export const readCustomThemes=()=>parseCustomThemes(localStorage.getItem(CUSTOM_THEME_KEY));
const write=(store:CustomThemeStore)=>{localStorage.setItem(CUSTOM_THEME_KEY,JSON.stringify(store));window.dispatchEvent(new CustomEvent('homecraft:custom-theme'));return store;};
const onColor=(color:string)=>{const [r,g,b]=color.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=.03928?x/12.92:((x+.055)/1.055)**2.4);return .2126*r+.7152*g+.0722*b>.38?'#1f1b18':'#ffffff';};
export function applyActiveCustomTheme(){const root=document.documentElement,store=readCustomThemes(),theme=store.themes.find(x=>x.id===store.active);for(const name of ['--user-button','--user-button-text','--accent','--stop'])root.style.removeProperty(name);delete root.dataset.customTheme;if(!theme)return;root.dataset.customTheme=theme.id;root.style.setProperty('--user-button',theme.button);root.style.setProperty('--user-button-text',onColor(theme.button));root.style.setProperty('--accent',theme.accent);root.style.setProperty('--stop',theme.accent);}
export function createCustomTheme(name:string,button:string,accent:string){if(!name.trim()||name.trim().length>30||!hex(button)||!hex(accent))return null;const store=readCustomThemes(),id=`user-${Date.now().toString(36)}`,theme={id,name:name.trim(),button:button.toLowerCase(),accent:accent.toLowerCase()};store.themes.push(theme);store.active=id;write(store);applyActiveCustomTheme();return theme;}
export function activateCustomTheme(id:string|null){const store=readCustomThemes();store.active=id&&store.themes.some(x=>x.id===id)?id:null;write(store);applyActiveCustomTheme();}
export function deleteCustomTheme(id:string){const store=readCustomThemes();store.themes=store.themes.filter(x=>x.id!==id);if(store.active===id)store.active=null;write(store);applyActiveCustomTheme();}
