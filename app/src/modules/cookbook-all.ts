// All 600 cookbook recipes, registered in their fixed order (ids and list order stay stable).
// Imported lazily by cookbook-load.ts; tests import it directly.
import { registerCookbook } from './kitchen-data.ts';
import { COOKBOOK_RECIPES } from './cookbook-recipes.ts';
import { WORLD_COOKBOOK_RECIPES } from './cookbook-world.ts';
import { ADDITIONAL_COOKBOOK_RECIPES } from './cookbook-additional.ts';
import { BAKERY_COOKBOOK_RECIPES } from './cookbook-bakery.ts';
import { EXTRA_COOKBOOK_RECIPES } from './cookbook-recipes-extra.ts';
registerCookbook([...COOKBOOK_RECIPES, ...EXTRA_COOKBOOK_RECIPES, ...WORLD_COOKBOOK_RECIPES, ...BAKERY_COOKBOOK_RECIPES, ...ADDITIONAL_COOKBOOK_RECIPES]);
