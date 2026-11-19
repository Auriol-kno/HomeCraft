// Shopping list data: categories (in the order they appear in a typical shop), staple products
// and a tiny keyword guesser so a typed item lands in the right aisle.
export const CATS = ['Warzywa i owoce', 'Pieczywo', 'Nabiał i jajka', 'Mięso i ryby', 'Suche i przetwory', 'Kawa, herbata, napoje', 'Mrożonki', 'Dom i chemia', 'Inne'] as const;
export type Cat = typeof CATS[number];

export const STAPLES: Record<Cat, string[]> = {
  'Warzywa i owoce': ['Pomidory', 'Ogórki', 'Cebula', 'Czosnek', 'Ziemniaki', 'Marchew', 'Papryka', 'Sałata', 'Jabłka', 'Banany', 'Cytryny', 'Awokado'],
  'Pieczywo': ['Chleb', 'Bułki', 'Tortille', 'Bagietka'],
  'Nabiał i jajka': ['Mleko', 'Jajka', 'Masło', 'Ser żółty', 'Śmietana', 'Jogurt naturalny', 'Twaróg', 'Mozzarella'],
  'Mięso i ryby': ['Pierś z kurczaka', 'Mięso mielone', 'Wędlina', 'Łosoś', 'Parówki'],
  'Suche i przetwory': ['Makaron', 'Ryż', 'Mąka', 'Cukier', 'Sól', 'Olej', 'Oliwa', 'Płatki owsiane', 'Passata pomidorowa', 'Fasola w puszce'],
  'Kawa, herbata, napoje': ['Kawa ziarnista', 'Herbata', 'Woda', 'Sok', 'Mleko owsiane'],
  'Mrożonki': ['Warzywa na patelnię', 'Frytki', 'Pierogi', 'Lody'],
  'Dom i chemia': ['Papier toaletowy', 'Ręczniki papierowe', 'Płyn do naczyń', 'Tabletki do zmywarki', 'Proszek do prania', 'Worki na śmieci', 'Folia aluminiowa', 'Gąbki'],
  'Inne': [],
};

const KEYS: [Cat, RegExp][] = [
  ['Warzywa i owoce', /pomidor|ogór|cebul|czosn|ziemniak|marche|papryk|sałat|jabł|banan|cytryn|awokad|pietrusz|szczypior|brokuł|kapust|truskaw|gruszk|pomarań|winogron|warzyw|owoc|grzyb|szpinak|cukini|bataty|limonk|mandaryn/i],
  ['Pieczywo', /chleb|bułk|tortill|bagiet|rogal|drożdżówk|chałk/i],
  ['Nabiał i jajka', /mleko|jajk|masł|ser\b|ser |śmietan|jogurt|twaróg|mozzarel|kefir|maślank|serek|parmezan|feta/i],
  ['Mięso i ryby', /kurczak|mięso|mielon|wędlin|łosoś|parówk|szynk|kiełbas|schab|boczek|ryb|krewet|tuńczyk|indyk/i],
  ['Kawa, herbata, napoje', /kawa|kawy|herbat|wod[aęy]|sok\b|sok |cola|piwo|wino|napój|napoje|mleko owsiane|kakao/i],
  ['Mrożonki', /mrożon|frytki|pierogi|lody|pizza mroż/i],
  ['Dom i chemia', /papier|ręcznik|płyn|tablet|proszek|worki|folia|gąbk|mydło|szampon|pasta do zęb|detergent|odkamien|świec|bateri|żarówk|filtr/i],
  ['Suche i przetwory', /makaron|ryż|mąk|cukier|sól|olej|oliw|płatki|passat|fasol|kasza|konserw|przypraw|musztard|keczup|miód|dżem|czekolad|orzech|herbatni|chips|sos|bulion|ocet|drożdże|proszek do piecz/i],
];

export function guessCat(name: string): Cat {
  const s = name.toLowerCase();
  for (const [c, r] of KEYS) if (r.test(s)) return c;
  return 'Inne';
}

export interface Item { id: string; name: string; qty: string; cat: Cat; done: boolean }
/** Split "2 l mleko", "mleko 2 l" or "jajka x10" into name and quantity. */
export function parseEntry(raw: string): { name: string; qty: string } {
  const s = raw.trim().replace(/\s+/g, ' ');
  const lead = /^(\d+(?:[.,]\d+)?\s?(?:kg|g|dag|l|ml|szt\.?|op\.?|x|×)?)\s+(.+)$/i.exec(s);
  if (lead) return { qty: lead[1].replace(/\s/g, ' '), name: lead[2] };
  const trail = /^(.+?)\s+(?:x|×)?(\d+(?:[.,]\d+)?\s?(?:kg|g|dag|l|ml|szt\.?|op\.?|x|×)?)$/i.exec(s);
  if (trail && /\d/.test(trail[2]) && !/^\d+$/.test(trail[1])) return { name: trail[1], qty: trail[2] };
  return { name: s, qty: '' };
}
export const cap = (s: string) => s ? s[0].toUpperCase() + s.slice(1) : s;
export function listText(items: Item[]): string {
  const out: string[] = [];
  for (const c of CATS) {
    const rows = items.filter(i => i.cat === c && !i.done);
    if (rows.length) { out.push(c.toUpperCase()); rows.forEach(i => out.push(`- ${i.name}${i.qty ? ' (' + i.qty + ')' : ''}`)); out.push(''); }
  }
  return out.join('\n').trim();
}
