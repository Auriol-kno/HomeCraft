// Settings → "Profil użytkownika": save all app settings under a name and switch between profiles.
// Rendered into #profileSlot inside the static settings dialog. Switching writes the profile's
// settings to their own keys and reloads, so the brewing engine and every store start from them.
import { useEffect, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { applySnapshot, MAX_PROFILES, parseProfiles, PROFILES_KEY, removeProfile, saveProfile, snapshot, type ProfilesState } from './profiles';
import { t } from './en';
import { TOAST_EVENT } from './timers';

const toast = (m: string) => window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: m }));
const read = () => { try { return parseProfiles(localStorage.getItem(PROFILES_KEY)); } catch { return parseProfiles(null); } };
const write = (s: ProfilesState) => { try { localStorage.setItem(PROFILES_KEY, JSON.stringify(s)); return true; } catch { toast(t('Nie udało się zapisać profilu: brak miejsca w pamięci.')); return false; } };
const when = (ms: number) => new Date(ms).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });

function Panel() {
  const [state, setState] = useState(read);
  const [name, setName] = useState('');
  const active = state.list.find(p => p.id === state.active);
  const commit = (next: ProfilesState | null, msg: string) => { if (next && write(next)) { setState(next); toast(msg); return true; } return false; };
  const save = (n: string) => {
    const next = saveProfile(state, n, snapshot(localStorage), Date.now());
    if (!next) { toast(state.list.length >= MAX_PROFILES ? t('Masz już maksymalną liczbę profili.') : t('Podaj nazwę profilu.')); return; }
    if (commit(next, `${t('Zapisano profil')}: ${next.list.find(p => p.id === next.active)!.name}`)) setName('');
  };
  const load = (id: string) => {
    const p = state.list.find(x => x.id === id); if (!p) return;
    if (!confirm(`${t('Wczytać ustawienia profilu')} „${p.name}”? ${t('Historia, kawy i przepisy zostają bez zmian. Aplikacja odświeży się.')}`)) return;
    try { applySnapshot(localStorage, p.data); localStorage.setItem(PROFILES_KEY, JSON.stringify({ ...state, active: p.id })); }
    catch { toast(t('Nie udało się wczytać profilu.')); return; }
    location.reload();
  };
  const del = (id: string) => { const p = state.list.find(x => x.id === id); if (p && confirm(`${t('Usunąć profil')} „${p.name}”? ${t('Obecne ustawienia aplikacji zostaną bez zmian.')}`)) commit(removeProfile(state, id), t('Profil usunięty')); };
  const enter = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); save(name); } };
  return <fieldset className="profile-settings">
    <legend>{t('Profil użytkownika')}</legend>
    <p className="subtle">{t('Zapisz wszystkie ustawienia aplikacji (wygląd, język, parametry parzenia, alerty, Mój sprzęt) jako profil i przełączaj się między nimi. Historia i dane kuchni są wspólne.')}</p>
    {active && <p className="hc-profile-active">{t('Aktywny profil')}: <b>{active.name}</b></p>}
    <label htmlFor="profileName">{t('Nazwa nowego profilu')}</label>
    <div className="hc-profile-new">
      <input id="profileName" value={name} maxLength={40} autoComplete="off" placeholder={t('np. Anna, Weekend')} onChange={e => setName(e.target.value)} onKeyDown={enter} />
      <button type="button" className="hc-primary" onClick={() => save(name)}>{t('Zapisz')}</button>
    </div>
    {active && <button type="button" className="hc-ghost hc-profile-update" onClick={() => save(active.name)}>{t('Zapisz obecne ustawienia w profilu')} „{active.name}”</button>}
    {state.list.length > 0 && <ul className="hc-profile-list">{state.list.map(p => <li key={p.id} className={p.id === state.active ? 'on' : ''}>
      <span><b>{p.name}</b><small>{t('zapisano')} {when(p.savedAt)}</small></span>
      <button type="button" className="hc-ghost" onClick={() => load(p.id)} aria-label={`${t('Wczytaj profil')} ${p.name}`}>{t('Wczytaj')}</button>
      <button type="button" className="hc-ghost" onClick={() => del(p.id)} aria-label={`${t('Usuń profil')} ${p.name}`}>{t('Usuń')}</button>
    </li>)}</ul>}
  </fieldset>;
}

export function ProfilesPanel() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById('profileSlot')); }, []);
  return slot ? createPortal(<Panel />, slot) : null;
}
