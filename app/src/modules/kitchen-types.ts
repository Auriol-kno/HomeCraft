export type Lane = 'hands' | 'fryer' | 'stove' | 'oven' | 'blender' | 'wait';
export interface KitchenTask {
  id: string; title: string; detail: string; lane: Lane; min: number;
  /** Tasks that must be finished before this one starts. */
  after: string[];
  /** Additional exclusive resources used while this step runs. */
  resources?: Lane[];
  /** Manual appliance setting shown on the card (never sent to the device). */
  fryer?: { mode: string; temp: number };
  /** Timer handed to the shared kitchen timers; `marks` are fractions of the time (shake / turn). */
  timer?: { name: string; marks?: number[]; act?: string };
  safety?: string;
}
export interface Ingredient { id: string; n: string; q: string }
export interface Recipe {
  id: string; name: string; short: string; servings: number; note: string;
  ingredients: Ingredient[]; equipment: { id: string; n: string }[]; prep: { id: string; n: string }[];
  tasks: KitchenTask[];
}

