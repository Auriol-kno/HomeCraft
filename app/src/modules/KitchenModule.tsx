// Kitchen OS demo: one cooking session under "Zaplanuj gotowanie".
// Plan (Mission Control) → Przygotuj (Mise en Place) → Gotuj (Cooking Timeline).
// Uses the shared kitchen timers (timers.ts) and the theme variables, like the other modules.
import { useEffect, useMemo, useRef, useState } from 'react';
import { CookingTimeline } from './CookingTimeline';
import { recipeKcal } from './cookbook-data';
import { t } from './en';
import { earliestServeAt, handsMinutes, hhmm, LANES, minLabel, recipeById, PANKO_DINNER, schedule, status, timeToday, totalMinutes, type Lane, type Planned, type Recipe, type Status } from './kitchen-data';
import { getKitchen, resetKitchen, setKitchen, useKitchen, type KitchenSession } from './kitchen-store';
import { SHOP_ADD_EVENT } from './shopping-data';
import { soundMark, unlockAudio, actOn, addTimer, clock, remaining, TOAST_EVENT, useTick, useTimers, type KTimer } from './timers';
import { ICONS, Icon } from './ui';

export type KitchenTab = 'plan' | 'mise' | 'cook';
export const KITCHEN_ICON = 'M4 4h16v6H4zM7 10v10m10-10v10M4 20h16M8 7h.01M12 7h4';
export const kitchenTabs: { id: KitchenTab; label: string; icon: string }[] = [
  { id: 'plan', label: 'Plan', icon: 'M3 5h18M3 12h18M3 19h12M17 16l3 3-3 3' },
  { id: 'mise', label: 'Przygotuj', icon: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2' },
  { id: 'cook', label: 'Gotuj', icon: ICONS.timer },
];
const MIN = 60000;
const laneLabel = (l: Lane) => t(LANES.find(x => x.id === l)!.label);
const inMin = (ms: number) => Math.max(0, Math.round(ms / MIN));
const toast = (m: string) => window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: m }));

/** Everything the three views need, recomputed every second while the module is open. */
function useCooking(active: boolean) {
  const s = useKitchen();
  const timers = useTimers();
  useTick(active, 1000);
  const recipe = recipeById(s.recipe) || PANKO_DINNER;
  const plan = useMemo(() => schedule(recipe, s.serveAt), [recipe, s.serveAt]);
  const now = Date.now();
  const st = status(plan, s, now, s.serveAt);
  return { s, recipe, plan, st, now, timers };
}

// ---- actions ------------------------------------------------------------------------------------
function startTask(task: Planned) {
  const now = Date.now();
  let id: string | undefined;
  if (task.timer) {
    const sec = task.min * 60;
    id = addTimer(task.timer.name, sec, {
      marks: (task.timer.marks || []).map(f => Math.round(sec * f)), act: task.timer.act || 'Sprawdź jedzenie',
      meta: task.fryer ? `${task.fryer.mode} · ${task.fryer.temp} °C` : 'Kitchen OS',
    });
  }
  setKitchen(s => ({ ...s, cooking: true, started: { ...s.started, [task.id]: now }, timers: id ? { ...s.timers, [task.id]: id } : s.timers }));
}
function finishTask(task: Planned, timers: KTimer[]) {
  // A finished task should not ring later: remove its timer (finished early) or silence it (ringing).
  const id = getKitchen().timers[task.id];
  if (id && timers.some(x => x.id === id)) actOn(id, 'del');
  setKitchen(s => ({ ...s, cooking: true, started: { [task.id]: Date.now(), ...s.started }, done: { ...s.done, [task.id]: Date.now() } }));
}
function undoTask(task: Planned) {
  setKitchen(s => { const done = { ...s.done }; delete done[task.id]; return { ...s, done }; });
}
const setServe = (ms: number) => setKitchen(s => ({ ...s, serveAt: Math.round(ms / MIN) * MIN }));

// ---- shared pieces -------------------------------------------------------------------------------
function FryerSetting({ task }: { task: Planned }) {
  if (!task.fryer) return null;
  return <div className="hc-device hc-k-device">
    <p className="hc-lbl">{t('Ustaw ręcznie na urządzeniu')}</p>
    <div className="hc-dev-row">
      <div><span className="hc-lbl">{t('Tryb')}</span><b className="hc-led sm">{task.fryer.mode}</b></div>
      <div><span className="hc-lbl">{t('Temp.')}</span><b className="hc-led">{task.fryer.temp}<small>°C</small></b></div>
      <div><span className="hc-lbl">{t('Czas')}</span><b className="hc-led">{task.min}<small>min</small></b></div>
    </div>
  </div>;
}

/** The card for a task to do now: big title, appliance setting, live timer and one main action. */
function NowCard({ task, s, st, timers, now, plan, early }: { task: Planned; s: KitchenSession; st: Status; timers: KTimer[]; now: number; plan: Planned[]; early?: boolean }) {
  const started = s.started[task.id] != null;
  const timer = timers.find(x => x.id === s.timers[task.id]);
  const timerOver = started && !!task.timer && (!timer || timer.done);
  const blocked = st.blocked[task.id];
  const title = (id: string) => plan.find(x => x.id === id)?.title || id;
  return <article className={'hc-card hc-k-now l-' + task.lane + (early ? ' is-early' : '')} aria-label={task.title}>
    {early && <p className="hc-k-early">{st.now.length ? t('Masz wolne ręce.') : t('Jesteś przed planem.')} {t('Możesz zacząć teraz albo poczekać do')} <b>{hhmm(task.start)}</b> ({t('za')} {minLabel(inMin(task.start - now))}).</p>}
    <p className="hc-k-meta"><span className={'hc-k-lane-tag l-' + task.lane}>{laneLabel(task.lane)}</span><span>{hhmm(task.start)}–{hhmm(task.end)} · {task.min} min</span></p>
    <h2 className="hc-k-title">{task.title}</h2>
    <p className="hc-k-detail">{task.detail}</p>
    <FryerSetting task={task} />
    {task.safety && <p className="hc-k-safety"><b>{t('Bezpieczeństwo')}:</b> {task.safety}</p>}
    {blocked && <p className="hc-k-block">{t('Najpierw skończ')}: {blocked.map(title).join(', ')}</p>}
    {started && timer && !timer.done && <div className="hc-k-timer" role="timer" aria-label={t('Pozostało')}><b>{clock(remaining(timer))}</b><span>{timer.paused ? t('pauza') : t('do końca')}</span>
      <button className="hc-ghost" onClick={() => actOn(timer.id, 'pause')}>{timer.paused ? t('Wznów') : t('Pauza')}</button></div>}
    {timerOver && <p className="hc-k-over">{t('Czas minął.')} {task.lane === 'fryer' ? t('Wyjmij i sprawdź.') : ''}</p>}
    <div className="hc-k-actions">
      {task.timer && !started
        ? <button className="hc-primary" disabled={!!blocked} onClick={() => startTask(task)}>{t('Start')} · {task.min} min</button>
        : <button className={timerOver || !task.timer ? 'hc-primary' : 'hc-ghost'} disabled={!!blocked} onClick={() => finishTask(task, timers)}>{t('Gotowe')} ✓</button>}
    </div>
    {started && task.start > now && <p className="subtle">{t('Zaczęte wcześniej niż w planie')} ({hhmm(task.start)})</p>}
  </article>;
}

// ---- views ---------------------------------------------------------------------------------------
function ServeTime({ s, recipe, now, locked }: { s: KitchenSession; recipe: Recipe; now: number; locked: boolean }) {
  const earliest = earliestServeAt(recipe, now);
  const tooEarly = !locked && s.serveAt < earliest;
  const bump = (m: number) => setServe(s.serveAt + m * MIN);
  return <div className="hc-card hc-k-serve">
    <label className="hc-k-serve-head" htmlFor="hc-k-time"><span className="hc-tag">{t('Godzina podania')}</span><b className="hc-k-clock">{hhmm(s.serveAt)}</b></label>
    <div className="hc-k-bump" role="group" aria-label={t('Zmień godzinę podania')}>
      <button className="hc-chip-btn" onClick={() => bump(-15)} aria-label={t('15 min wcześniej')}>−15</button>
      <button className="hc-chip-btn" onClick={() => bump(-5)} aria-label={t('5 min wcześniej')}>−5</button>
      <button className="hc-chip-btn" onClick={() => bump(5)} aria-label={t('5 min później')}>+5</button>
      <button className="hc-chip-btn" onClick={() => bump(15)} aria-label={t('15 min później')}>+15</button>
      <input id="hc-k-time" className="hc-input hc-k-input" type="time" step={60} value={hhmm(s.serveAt)} aria-label={t('Wpisz godzinę podania')} onChange={e => { const v = timeToday(e.target.value, now); if (v) setServe(v); }} />
    </div>
    {tooEarly
      ? <p className="hc-k-warn" role="status">{t('Za mało czasu na cały plan. Najwcześniej podasz o')} <b>{hhmm(earliest)}</b>. <button className="hc-link" onClick={() => setServe(earliest)}>{t('Ustaw')} {hhmm(earliest)}</button></p>
      : !locked && <button className="hc-link" onClick={() => setServe(earliest)}>{t('Gotuję teraz: podanie o')} {hhmm(earliest)}</button>}
    {locked && <p className="subtle">{t('Po zmianie godziny plan się przelicza. Działające timery liczą dalej bez zmian.')}</p>}
  </div>;
}

function PlanView({ c, onTab }: { c: ReturnType<typeof useCooking>; onTab: (x: KitchenTab) => void }) {
  const { s, recipe, plan, st, now } = c;
  const [confirm, setConfirm] = useState(false);
  const progress = st.doneCount > 0 || Object.keys(s.started).length > 0;
  const first = plan[0], fryerRuns = recipe.tasks.filter(x => x.lane === 'fryer' && x.fryer?.mode !== 'PREHEAT').length;
  return <section className="screen" aria-label={t('Plan')}>
    {s.cooking && !st.finished && <div className="hc-card hc-k-hero" role="group" aria-label={t('W trakcie')}>
      <p className="hc-tag">{t('W trakcie')} · {st.doneCount}/{st.total}</p>
      <p className="hc-k-hero-now"><span>{t('Teraz')}:</span> {st.now.length ? st.now.map(x => x.title).join(' + ') : t('nic pilnego')}</p>
      {st.next[0] && <p className="subtle">{t('Następnie')}: {hhmm(st.next[0].start)} {st.next[0].title}</p>}
      <p className="hc-k-finish">{t('Koniec o')} <b>{hhmm(st.finishAt)}</b>{st.lateMin > 0 && <em> +{st.lateMin} min</em>}</p>
      <button className="hc-primary" onClick={() => onTab('cook')}>{t('Wróć do gotowania')} →</button>
    </div>}
    <div className="hc-card hc-k-recipe" aria-label={t('Wybrane danie')}>
      <p className="hc-tag">{t('Wybrane danie')}</p><a className="hc-ghost" href="#dom/recipes">{t('Książka kucharska')}</a>
      <h2 className="hc-h3">{recipe.name}</h2>
      <p className="hc-k-facts"><span>{recipe.servings} {t('porcje')}</span><span>{t('razem')} {minLabel(totalMinutes(recipe))}</span><span>{t('Twoja praca')} {handsMinutes(recipe)} min</span>{fryerRuns > 0 && <span>Air Fryer × {fryerRuns}</span>}<span>≈ {recipeKcal(recipe)} {t('kcal / porcję')}</span></p>
      <p className="subtle">{recipe.note}</p>
    </div>
    <ServeTime s={s} recipe={recipe} now={now} locked={s.cooking} />
    <div className="hc-card">
      <p className="hc-k-summary"><span>{t('Start')} <b>{hhmm(first.start)}</b></span><span>{t('Podanie')} <b>{hhmm(s.serveAt)}</b></span></p>
      <CookingTimeline plan={plan} now={now} />
      <p className="subtle">{t('Pierwszy krok')}: {first.title}. {t('Plan uwzględnia sprzęt i czas oczekiwania. Ty robisz jedną rzecz naraz.')}</p>
    </div>
    <div className="hc-k-cta">
      {!s.cooking && <button className="hc-primary" onClick={() => onTab('mise')}>{t('Dalej: przygotuj składniki')} →</button>}
      {!s.cooking && <button className="hc-ghost" onClick={() => { setKitchen(x => ({ ...x, cooking: true })); onTab('cook'); }}>{t('Pomiń i zacznij gotować')}</button>}
      {(s.cooking || progress) && (confirm
        ? <div className="hc-k-confirm" role="group" aria-label={t('Zacznij od nowa')}><span>{t('Wyczyścić postęp tego gotowania?')}</span>
            <button className="hc-ghost" onClick={() => { const ids = Object.values(getKitchen().timers); c.timers.filter(x => ids.includes(x.id)).forEach(x => actOn(x.id, 'del')); resetKitchen(); setConfirm(false); }}>{t('Tak, od nowa')}</button>
            <button className="hc-ghost" onClick={() => setConfirm(false)}>{t('Anuluj')}</button></div>
        : <button className="hc-ghost" onClick={() => setConfirm(true)}>{t('Zacznij od nowa')}</button>)}
    </div>
    <p className="hc-k-note">{t('Czasy są orientacyjne. Aplikacja nie steruje urządzeniami: ustawienia wpisujesz ręcznie.')}</p>
  </section>;
}

function MiseView({ c, onTab }: { c: ReturnType<typeof useCooking>; onTab: (x: KitchenTab) => void }) {
  const { s, recipe } = c;
  const groups: { title: string; items: { id: string; n: string; q?: string }[] }[] = [
    { title: `${t('Składniki')} · ${recipe.servings} ${t('porcje')}`, items: recipe.ingredients },
    { title: t('Sprzęt'), items: recipe.equipment },
    { title: t('Przed startem'), items: recipe.prep },
  ];
  const all = groups.flatMap(g => g.items), checked = all.filter(x => s.mise.includes(x.id)).length;
  const missing = recipe.ingredients.filter(x => !s.mise.includes(x.id));
  const toggle = (id: string) => setKitchen(x => ({ ...x, mise: x.mise.includes(id) ? x.mise.filter(m => m !== id) : [...x.mise, id] }));
  const toShop = () => {
    window.dispatchEvent(new CustomEvent(SHOP_ADD_EVENT, { detail: missing.map(x => ({ name: x.n, qty: x.q })) }));
    toast(`${t('Dodano do listy zakupów')}: ${missing.length}`);
  };
  return <section className="screen" aria-label={t('Przygotuj')}>
    <div className="hc-shop-prog" role="group" aria-label={t('Postęp przygotowania')}>
      <div><b>{checked}/{all.length}</b> <span>{t('gotowe')}</span></div>
      <div className="hc-bar" aria-hidden="true"><i style={{ width: Math.round(checked / all.length * 100) + '%' }} /></div>
    </div>
    {groups.map(g => <div key={g.title} className="hc-card hc-aisle">
      <h3 className="hc-h3">{g.title}</h3>
      <ul className="hc-items">{g.items.map(i => { const on = s.mise.includes(i.id); return <li key={i.id} className={on ? 'is-done' : ''}>
        <button className={'hc-tick' + (on ? ' on' : '')} role="checkbox" aria-checked={on} aria-label={i.n} onClick={() => toggle(i.id)} />
        <span className="hc-iname" onClick={() => toggle(i.id)}>{i.n}{i.q && <em>{i.q}</em>}</span>
      </li>; })}</ul>
    </div>)}
    <div className="hc-k-cta">
      {missing.length > 0 && <button className="hc-ghost" onClick={toShop}>{t('Brakuje? Dodaj nieodhaczone składniki do Zakupów')} ({missing.length})</button>}
      <button className="hc-primary" onClick={() => { setKitchen(x => ({ ...x, cooking: true })); onTab('cook'); }}>{s.cooking ? t('Wróć do gotowania') : t('Zaczynamy gotowanie')} →</button>
      {!s.cooking && <p className="subtle">{t('Nie musisz odhaczać wszystkiego, żeby zacząć.')}</p>}
    </div>
  </section>;
}

function CookView({ c, onTab }: { c: ReturnType<typeof useCooking>; onTab: (x: KitchenTab) => void }) {
  const { s, recipe, plan, st, now, timers } = c;
  if (!s.cooking) return <section className="screen" aria-label={t('Gotuj')}>
    <div className="hc-card hc-k-hero"><p className="hc-tag">{t('Jeszcze nie zaczęto')}</p>
      <h2 className="hc-k-title">{recipe.name}</h2>
      <p>{t('Start o')} <b>{hhmm(plan[0].start)}</b>, {t('podanie o')} <b>{hhmm(s.serveAt)}</b>.</p>
      <button className="hc-primary" onClick={() => setKitchen(x => ({ ...x, cooking: true }))}>{t('Zaczynamy gotowanie')} →</button>
      <button className="hc-ghost" onClick={() => onTab('plan')}>{t('Zmień godzinę podania')}</button>
    </div>
    <StepList plan={plan} s={s} now={now} />
  </section>;
  const firstPending = st.next[0];
  const notStarted = !st.now.length && Object.keys(s.done).length === 0;
  // Ahead of the plan or with free hands: offer the next step that is ready (its prerequisites are done).
  // While a timer runs, only work by hand is suggested, so the Air Fryer order is never changed.
  const handsFree = !st.now.some(x => x.lane === 'hands');
  const early = notStarted ? undefined : !st.now.length ? firstPending
    : handsFree ? st.next.find(x => x.lane === 'hands' && x.after.every(id => s.done[id] != null)) : undefined;
  const upcoming = st.next.filter(x => x !== early).slice(0, 2);
  return <section className="screen hc-k-cook" aria-label={t('Gotuj')}>
    <div className="hc-k-status" role="group" aria-label={t('Stan gotowania')}>
      <div><span>{t('Koniec o')}</span><b>{hhmm(st.finishAt)}</b></div>
      <div><span>{t('Kroki')}</span><b>{st.doneCount}/{st.total}</b></div>
      <div><span>{t('Następne')}</span><b>{firstPending ? hhmm(firstPending.start) : '—'}</b></div>
    </div>
    {st.lateMin > 0 && !st.finished && <div className="hc-k-late" role="status">
      <p>{t('Opóźnienie')} <b>{st.lateMin} min</b>. {t('Podanie ok.')} <b>{hhmm(st.finishAt)}</b>.</p>
      <button className="hc-ghost" onClick={() => setServe(st.finishAt)}>{t('Przelicz plan na')} {hhmm(st.finishAt)}</button>
    </div>}
    {st.finished
      ? <div className="hc-card hc-k-hero"><p className="hc-tag">{t('Gotowe')}</p><h2 className="hc-k-title">{t('Smacznego!')}</h2>
          <p>{recipe.name}. {t('Wszystkie kroki odhaczone.')}</p>
          <button className="hc-primary" onClick={() => { resetKitchen(); onTab('plan'); }}>{t('Zakończ i zaplanuj kolejne')}</button></div>
      : <>
        <h2 className="hc-k-sect">{t('Teraz')}{st.now.length + (early ? 1 : 0) > 1 && <small> · {st.now.length + (early ? 1 : 0)} {t('równolegle')}</small>}</h2>
        {st.now.map(x => <NowCard key={x.id} task={x} s={s} st={st} timers={timers} now={now} plan={plan} />)}
        {notStarted && firstPending && <div className="hc-card hc-k-wait">
          <p>{t('Teraz nic pilnego.')} {t('Pierwszy krok za')} <b>{minLabel(inMin(firstPending.start - now))}</b> ({hhmm(firstPending.start)}).</p>
          <button className="hc-primary" onClick={() => setServe(earliestServeAt(recipe, now))}>{t('Gotuję teraz: podanie o')} {hhmm(earliestServeAt(recipe, now))}</button>
        </div>}
        {early && <NowCard key={early.id} task={early} s={s} st={st} timers={timers} now={now} plan={plan} early />}
        {upcoming.length > 0 && <>
          <h2 className="hc-k-sect">{t('Następnie')}</h2>
          <ol className="hc-k-next">{upcoming.map(x => <li key={x.id}><b>{hhmm(x.start)}</b><span>{x.title}<small>{laneLabel(x.lane)} · {x.min} min · {t('za')} {minLabel(inMin(x.start - now))}</small></span></li>)}</ol>
        </>}
      </>}
    <details className="details-card hc-k-all" open={st.finished || undefined}><summary>{t('Cały plan')} ({st.doneCount}/{st.total}) <span>+</span></summary><StepList plan={plan} s={s} now={now} editable timers={timers} /></details>
    <p className="hc-k-note">{t('Czasy są orientacyjne. Sprawdź gotowość według wskazówek przepisu. Przy zablokowanym ekranie alarm nie jest gwarantowany.')}</p>
  </section>;
}

function StepList({ plan, s, now, editable, timers }: { plan: Planned[]; s: KitchenSession; now: number; editable?: boolean; timers?: KTimer[] }) {
  return <ol className="hc-k-steps">{plan.map(x => {
    const done = s.done[x.id] != null, active = !done && s.started[x.id] != null;
    return <li key={x.id} className={(done ? 'is-done ' : '') + (active ? 'is-active ' : '') + 'l-' + x.lane}>
      <span className="hc-k-time">{hhmm(x.start)}</span>
      <span className="hc-k-step"><b>{x.title}</b><small><span className={'hc-k-lane-tag l-' + x.lane}>{laneLabel(x.lane)}</span> {x.min} min{x.fryer ? ` · ${x.fryer.mode} ${x.fryer.temp} °C` : ''}{active ? ' · ' + t('w toku') : ''}{!done && !active && x.start < now ? ' · ' + t('spóźnione') : ''}</small></span>
      {editable && <button className={'hc-tick' + (done ? ' on' : '')} role="checkbox" aria-checked={done} aria-label={`${t('Gotowe')}: ${x.title}`} onClick={() => done ? undoTask(x) : finishTask(x, timers || [])} />}
    </li>;
  })}</ol>;
}

/** Entry point shown in the Air Fryer and Dom modules. */
export function PlanCta({ onOpen }: { onOpen: () => void }) {
  const s = useKitchen();
  const recipe = recipeById(s.recipe) || PANKO_DINNER;
  const busy = s.cooking && Object.keys(s.done).length < recipe.tasks.length;
  return <button className="hc-k-entry" onClick={onOpen}>
    <Icon d={KITCHEN_ICON} />
    <span><b>{busy ? t('Gotowanie w toku') : t('Zaplanuj gotowanie')}</b><small>{busy ? `${recipe.short} · ${t('podanie')} ${hhmm(s.serveAt)}` : t('Obiad na konkretną godzinę: plan, składniki, kroki i timery')}</small></span>
    <span aria-hidden="true">→</span>
  </button>;
}

export function KitchenModule({ active, tab, onTab }: { active: boolean; tab: KitchenTab; onTab: (x: KitchenTab) => void }) {
  const c = useCooking(active);
  const main = useRef<HTMLElement>(null);
  const [wakeStatus,setWakeStatus] = useState('Podtrzymanie ekranu włącza się podczas gotowania.');
  useEffect(() => { if(active){ main.current?.scrollTo(0, 0); main.current?.querySelector('h1')?.focus({preventScroll:true}); } }, [tab, active]);
  // Report the real wake-lock state; the OS may release or deny a lock at any time.
  useEffect(() => {
    if (!active || tab !== 'cook' || !c.s.cooking) { setWakeStatus('Podtrzymanie ekranu włącza się podczas gotowania.'); return; }
    if (!navigator.wakeLock) { setWakeStatus('Podtrzymanie ekranu niedostępne.'); return; }
    let lock: WakeLockSentinel | null = null, gone = false, pending = false;
    const take = async () => {
      if (gone || pending || lock || document.visibilityState !== 'visible') return;
      pending = true;
      try {
        const acquired = await navigator.wakeLock.request('screen');
        if (gone) { void acquired.release(); return; }
        lock = acquired; setWakeStatus('Podtrzymanie ekranu aktywne.');
        acquired.addEventListener('release', () => { lock = null; if (!gone) setWakeStatus('Podtrzymanie ekranu zwolnione przez system.'); });
      } catch { if (!gone) setWakeStatus('System odmówił podtrzymania ekranu.'); }
      finally { pending = false; }
    };
    void take(); document.addEventListener('visibilitychange', take);
    return () => { gone = true; document.removeEventListener('visibilitychange', take); void lock?.release().catch(() => {}); };
  }, [active, tab, c.s.cooking]);
  if (!active) return null;
  const heading = tab === 'plan' ? ['KITCHEN OS', 'Zaplanuj gotowanie'] : tab === 'mise' ? ['MISE EN PLACE', 'Przygotuj wszystko'] : ['GOTOWANIE', c.recipe.short];
  return <>
    <main ref={main} className="app-content hc-kitchen" aria-label={t('Kitchen OS')}>
      <div className="screen-heading"><p className="overline">{t(heading[0])}</p><h1 tabIndex={-1}>{t(heading[1])}</h1></div>
      <aside className="hc-card hc-k-device-note" aria-label={t('Ekran i alarm')}>
        <p>{t('Zostaw aplikację otwartą. Po zablokowaniu ekranu lub przejściu w tło alarm może nie zabrzmieć.')}</p>
        <p role="status">{t(wakeStatus)}</p>
        <button className="hc-ghost" onClick={() => { unlockAudio(); soundMark(); }}>{t('Sprawdź dźwięk')}</button>
      </aside>
      {tab === 'plan' && <PlanView c={c} onTab={onTab} />}
      {tab === 'mise' && <MiseView c={c} onTab={onTab} />}
      {tab === 'cook' && <CookView c={c} onTab={onTab} />}
    </main>
  </>;
}
