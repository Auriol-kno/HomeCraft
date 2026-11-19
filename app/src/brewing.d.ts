/** Contract between React navigation and the retained, imperative brewing engine. */
export interface BrewStatus { running: boolean; method: string; seconds: number }
export type Screen = 'home' | 'timer' | 'equipment' | 'history' | 'rating';
export interface BrewingController { finish(): void }
export function initBrewing(navigate:(screen: Screen)=>void, notify:(status:BrewStatus)=>void): BrewingController;
