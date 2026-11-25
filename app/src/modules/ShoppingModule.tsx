import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { t } from './en';
import { cap, CATS, guessCat, listText, parseEntry, SHOP_ADD_EVENT, STAPLES, type Cat, type Item } from './shopping-data';
import { Icon } from './ui';

export type ShopTab = 'list' | 'staples';
export const SHOP_ICON = 'M3 4h2.5l2 11h10.5l2-8H6.4M10 20a1 1 0 1 0 0 .01M17 20a1 1 0 1 0 0 .01';
export const shopTabs: { id: ShopTab; label: string; icon: string }[] = [
  { id: 'list', label: 'Lista', icon: SHOP_ICON },
  { id: 'staples', label: 'Produkty', icon: 'M4 5h16M4 12h16M4 19h10M18 17v4m-2-2h4' },
];
const KEY = 'homecraft.shopping.v1';
const load = (): Item[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(i => i && typeof i.id === 'string' && typeof i.name === 'string').map(i => ({ id: i.id, name: String(i.name).slice(0, 80), qty: String(i.qty || '').slice(0, 20), cat: (CATS as readonly string[]).includes(i.cat) ? i.cat : 'Inne', done: !!i.done })).slice(0, 300) : [];
  } catch { return []; }
};
let seq = 0;
const newId = () => Date.now().toString(36) + (seq++).toString(36);

export function ShoppingModule({ active, tab, onTab }: { active: boolean; tab: ShopTab; onTab: (t: ShopTab) => void }) {
  const [items, setItems] = useState<Item[]>(load);
  const [text, setText] = useState(''), [note, setNote] = useState('');
  const main = useRef<HTMLElement>(null);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ } }, [items]);
  useEffect(() => { if(active){main.current?.scrollTo(0, 0);requestAnimationFrame(()=>main.current?.querySelector('h1')?.focus({preventScroll:true}));} }, [tab,active]);
  // Products sent from other modules (e.g. missing Kitchen OS ingredients); skips ones already on the list.
  useEffect(() => {
    const on = (e: Event) => {
      const list = (e as CustomEvent<{ name: string; qty?: string }[]>).detail;
      if (!Array.isArray(list)) return;
      setItems(v => {
        let out = v;
        for (const x of list) {
          const n = cap(String(x?.name || '').trim()).slice(0, 80);
          if (!n || out.some(i => !i.done && i.name.toLowerCase() === n.toLowerCase())) continue;
          out = [{ id: newId(), name: n, qty: String(x.qty || '').slice(0, 20), cat: guessCat(n), done: false }, ...out];
        }
        return out;
      });
    };
    window.addEventListener(SHOP_ADD_EVENT, on);
    return () => window.removeEventListener(SHOP_ADD_EVENT, on);
  }, []);
  useEffect(() => { if (!note) return; const id = setTimeout(() => setNote(''), 2500); return () => clearTimeout(id); }, [note]);
  const open = items.filter(i => !i.done), done = items.filter(i => i.done);
  const has = (n: string) => items.some(i => !i.done && i.name.toLowerCase() === n.toLowerCase());
  const add = (name: string, qty = '', cat?: Cat) => {
    const n = cap(name.trim()); if (!n) return;
    if (has(n)) { setNote(`${n}: ${t('już na liście')}`); return; }
    setItems(v => [{ id: newId(), name: n, qty, cat: cat || guessCat(n), done: false }, ...v]);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); const p = parseEntry(text); add(p.name, p.qty); setText(''); };
  const toggle = (id: string) => setItems(v => v.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const del = (id: string) => setItems(v => v.filter(i => i.id !== id));
  const grouped = useMemo(() => CATS.map(c => ({ c, rows: open.filter(i => i.cat === c) })).filter(g => g.rows.length), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = items.length, pct = total ? Math.round(done.length / total * 100) : 0;
  const copy = async () => {
    const txt = listText(items);
    if (!txt) { setNote(t('Lista jest pusta')); return; }
    try {
      if (navigator.share) { await navigator.share({ title: t('Lista zakupów'), text: txt }); return; }
      await navigator.clipboard.writeText(txt); setNote(t('Skopiowano listę'));
    } catch { setNote(t('Nie udało się skopiować')); }
  };
  const heading = tab === 'list' ? ['LISTA ZAKUPÓW', 'Co kupić?'] : ['SZYBKIE DODAWANIE', 'Częste produkty'];
  return <>
    <main ref={main} hidden={!active} className="app-content" aria-label={t('Zakupy')}>
      <div className="screen-heading"><p className="overline">{t(heading[0])}</p><h1 tabIndex={-1}>{t(heading[1])}</h1></div>
      {tab === 'list' && <section className="screen" aria-label={t('Lista')}>
        <form className="hc-card hc-add" onSubmit={submit}>
          <input className="hc-input" value={text} onChange={e => setText(e.target.value)} placeholder={t('Dodaj produkt, np. 2 l mleko')} maxLength={80} aria-label={t('Nowy produkt')} autoComplete="off" enterKeyHint="done" />
          <button className="hc-primary" type="submit" disabled={!text.trim()}>{t('Dodaj')}</button>
        </form>
        {note && <p className="hc-note" role="status">{note}</p>}
        {total > 0 && <div className="hc-shop-prog" role="group" aria-label={t('Postęp zakupów')}>
          <div><b>{done.length}/{total}</b> <span>{t('w koszyku')}</span></div>
          <div className="hc-bar" aria-hidden="true"><i style={{ width: pct + '%' }} /></div>
        </div>}
        {total === 0 && <div className="hc-card hc-empty-shop"><Icon d={SHOP_ICON} /><h3 className="hc-h3">{t('Lista jest pusta')}</h3><p className="subtle">{t('Wpisz produkt powyżej albo wybierz z zakładki Produkty.')}</p></div>}
        {grouped.map(g => <div key={g.c} className="hc-card hc-aisle">
          <h3 className="hc-h3">{t(g.c)} <small>{g.rows.length}</small></h3>
          <ul className="hc-items">{g.rows.map(i => <li key={i.id}>
            <button className="hc-tick" role="checkbox" aria-checked={false} aria-label={`${t('Kupione')}: ${i.name}`} onClick={() => toggle(i.id)} />
            <span className="hc-iname">{i.name}{i.qty && <em>{i.qty}</em>}</span>
            <button className="hc-x" onClick={() => del(i.id)} aria-label={`${t('Usuń')} ${i.name}`}><Icon d="M6 6l12 12M18 6 6 18" /></button>
          </li>)}</ul>
        </div>)}
        {done.length > 0 && <div className="hc-card hc-aisle hc-bought">
          <h3 className="hc-h3">{t('W koszyku')} <small>{done.length}</small></h3>
          <ul className="hc-items">{done.map(i => <li key={i.id} className="is-done">
            <button className="hc-tick on" role="checkbox" aria-checked={true} aria-label={`${t('Cofnij')}: ${i.name}`} onClick={() => toggle(i.id)} />
            <span className="hc-iname">{i.name}{i.qty && <em>{i.qty}</em>}</span>
            <button className="hc-x" onClick={() => del(i.id)} aria-label={`${t('Usuń')} ${i.name}`}><Icon d="M6 6l12 12M18 6 6 18" /></button>
          </li>)}</ul>
        </div>}
        {total > 0 && <div className="hc-shop-actions">
          <button className="hc-ghost" onClick={copy}>{typeof navigator !== 'undefined' && 'share' in navigator ? t('Udostępnij listę') : t('Kopiuj listę')}</button>
          {done.length > 0 && <button className="hc-ghost" onClick={() => setItems(v => v.filter(i => !i.done))}>{t('Usuń kupione')}</button>}
          <button className="hc-ghost" onClick={() => { if (window.confirm(t('Wyczyścić całą listę?'))) setItems([]); }}>{t('Wyczyść')}</button>
        </div>}
      </section>}
      {tab === 'staples' && <section className="screen" aria-label={t('Produkty')}>
        <p className="subtle">{t('Dotknij produktu, żeby dodać go do listy. Zaznaczone są już na liście.')}</p>
        {CATS.filter(c => STAPLES[c].length).map(c => <div key={c} className="hc-card">
          <h3 className="hc-h3">{t(c)}</h3>
          <div className="hc-chips-wrap">{STAPLES[c].map(n => <button key={n} className="hc-chip" aria-pressed={has(n)} onClick={() => { if (has(n)) { const f = items.find(i => !i.done && i.name.toLowerCase() === n.toLowerCase()); if (f) del(f.id); } else add(n, '', c); }}>{t(n)}</button>)}</div>
        </div>)}
      </section>}
    </main>
  </>;
}
