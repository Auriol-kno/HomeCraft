// Loads the cookbook chunk once. Safe to call many times; failures (offline before the chunk was
// ever cached) are retried on the next call.
import { useSyncExternalStore } from 'react';
import { isCookbookLoaded, onCookbookLoaded } from './kitchen-data';
let pending: Promise<void> | null = null;
export function loadCookbook(): Promise<void> {
  if (isCookbookLoaded()) return Promise.resolve();
  return pending ??= import('./cookbook-all').then(() => undefined, e => { pending = null; throw e; });
}
export const useCookbookReady = () => useSyncExternalStore(onCookbookLoaded, isCookbookLoaded, isCookbookLoaded);
