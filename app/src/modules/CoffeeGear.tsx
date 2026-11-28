// "Mój sprzęt": choose one of 5 grinders and one of 5 portafilter machines, see their parameters,
// how to start espresso, and a service schedule with "done today" and next due dates.
// Own key (homecraft.coffeegear.v1); the Crema Lab gear (K-Pro, Lelit) is untouched.
import { useSyncExternalStore } from 'react';
import { EMPTY_GEAR, gearById, GEAR_KEY, GRINDERS, MACHINES, parseGear, taskKey, taskStatus, type CoffeeGear, type GearState, type ServiceTask } from './coffee-gear-data';
import { t } from './en';
import { TOAST_EVENT } from './timers';

let cached: GearState | null = null;
const listeners = new Set<() => void>();
const read = () => { try { return parseGear(localStorage.getItem(GEAR_KEY)); } catch { return { ...EMPTY_GEAR }; } };
const get = () => (cached ??= read());
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
function save(update: (s: GearState) => GearState) {
  cached = update(get());
  try { localStorage.setItem(GEAR_KEY, JSON.stringify(cached)); }
  catch { window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: t('Nie udało się zapisać. Zmiana działa do zamknięcia aplikacji.') })); }
  listeners.forEach(l => l());
}
if (typeof window !== 'undefined') window.addEventListener('storage', e => { if (e.key === GEAR_KEY || e.key === null) { cached = read(); listeners.forEach(l => l()); } });
export const useGear = () => useSyncExternalStore(subscribe, get, get);

const date = (ms: number) => new Date(ms).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
const INTERVALS = [1, 2, 3, 7, 14, 21, 30, 60, 90, 120, 150, 180, 365];

function ServiceRow({ gear, task, state, now }: { gear: CoffeeGear; task: ServiceTask; state: GearState; now: number }) {
  const s = taskStatus(state, gear, task, now), key = taskKey(gear, task);
  const label = s.state === 'never' ? t('jeszcze nie odnotowano') : s.state === 'overdue' ? `${t('po terminie')} ${-(s.daysLeft ?? 0)} ${t('dni')}`
    : s.daysLeft === 0 ? t('dziś') : `${t('za')} ${s.daysLeft} ${t('dni')} (${date(s.dueAt!)})`;
  const options = INTERVALS.includes(s.every) ? INTERVALS : [...INTERVALS, s.every].sort((a, b) => a - b);
  return <li className={'hc-gear-task is-' + s.state}>
    <div className="hc-gear-task-head"><b>{t(task.title)}</b><span className="hc-gear-due">{label}</span></div>
    <p>{t(task.detail)}</p>
    <div className="hc-gear-task-actions">
      <label>{t('Co')} <select value={s.every} onChange={e => { const n = Number(e.target.value); save(x => ({ ...x, every: { ...x.every, [key]: n } })); }} aria-label={`${t('Co ile dni')}: ${t(task.title)}`}>
        {options.map(n => <option key={n} value={n}>{n === 1 ? t('codziennie') : `${n} ${t('dni')}`}</option>)}
      </select></label>
      <button className={s.state === 'overdue' || s.state === 'never' ? 'hc-primary' : 'hc-ghost'} onClick={() => save(x => ({ ...x, done: { ...x.done, [key]: Date.now() } }))}>{t('Zrobione dziś')}</button>
    </div>
    {s.last && <small>{t('Ostatnio')}: {date(s.last)}</small>}
  </li>;
}

function GearDetail({ gear, state, now }: { gear: CoffeeGear; state: GearState; now: number }) {
  const overdue = gear.service.filter(task => taskStatus(state, gear, task, now).state === 'overdue').length;
  return <div className="hc-card hc-gear-detail">
    <p className="hc-tag">{gear.kind === 'grinder' ? t('Twój młynek') : t('Twój ekspres')}</p>
    <h3 className="hc-h3">{gear.name}</h3>
    <dl className="hc-gear-specs">{gear.specs.map(s => <div key={s.label}><dt>{t(s.label)}</dt><dd>{s.value}</dd></div>)}</dl>
    <h4>{t('Espresso: jak zacząć')}</h4>
    <ol className="hc-gear-steps">{gear.espresso.map(x => <li key={x}>{x}</li>)}</ol>
    {gear.notes?.map(n => <p key={n} className="hc-k-note">{n}</p>)}
    <h4>{t('Serwis')}{overdue > 0 && <span className="hc-gear-badge">{overdue} {t('po terminie')}</span>}</h4>
    <ul className="hc-gear-tasks">{gear.service.map(task => <ServiceRow key={task.id} gear={gear} task={task} state={state} now={now} />)}</ul>
    <p className="hc-k-note">{t('Interwały są orientacyjne dla użytku domowego. Pierwszeństwo ma instrukcja producenta Twojego modelu.')}</p>
    <details className="hc-gear-sources"><summary>{t('Źródła parametrów')}</summary>
      <ul>{gear.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}</ul></details>
  </div>;
}

function Picker({ title, list, value, onPick }: { title: string; list: CoffeeGear[]; value: string | null; onPick: (id: string | null) => void }) {
  return <fieldset className="hc-gear-pick">
    <legend>{t(title)}</legend>
    <div className="hc-gear-options" role="radiogroup" aria-label={t(title)}>
      {list.map(g => <button key={g.id} type="button" role="radio" aria-checked={value === g.id} className={value === g.id ? 'on' : ''} onClick={() => onPick(value === g.id ? null : g.id)}>
        <b>{g.short}</b><small>{g.tagline}</small></button>)}
    </div>
  </fieldset>;
}

export function CoffeeGearScreen() {
  const state = useGear();
  const now = Date.now();
  const grinder = state.grinder ? gearById(state.grinder) : undefined, machine = state.machine ? gearById(state.machine) : undefined;
  return <div className="hc-gear">
    <p className="subtle">{t('Wybierz swój młynek i ekspres kolbowy: zobaczysz parametry, punkt startowy espresso i harmonogram serwisu. Sprzęt z zakładek Młynek i Lelit Anna zostaje bez zmian.')}</p>
    <Picker title="Młynek" list={GRINDERS} value={state.grinder} onPick={id => save(x => ({ ...x, grinder: id }))} />
    {grinder && <GearDetail gear={grinder} state={state} now={now} />}
    <Picker title="Ekspres kolbowy" list={MACHINES} value={state.machine} onPick={id => save(x => ({ ...x, machine: id }))} />
    {machine && <GearDetail gear={machine} state={state} now={now} />}
  </div>;
}
