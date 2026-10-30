/** Lightweight meal used by lists, favorites and as the placeholder while `MealDetail` loads. */
export type MealSummary = {
  id: string;
  name: string;
  thumbnailUrl: string;
};

export type MealCategory = {
  id: string;
  name: string;
  thumbnailUrl: string;
};

export type Ingredient = {
  name: string;
  measure: string;
};

export type MealDetail = MealSummary & {
  category: string | null;
  area: string | null;
  instructions: string;
  ingredients: Ingredient[];
  tags: string[];
  youtubeUrl: string | null;
  sourceUrl: string | null;
};

/** TheMealDB serves resized variants at `/medium`, several times lighter for grids. */
export const previewUrl = (meal: MealSummary) => `${meal.thumbnailUrl}/medium`;

export const ingredientImageUrl = (ingredient: Ingredient) =>
  `https://www.themealdb.com/images/ingredients/${encodeURIComponent(ingredient.name)}-small.png`;

const STEP_HEADING = /^(step\s*\d+|\d+\.?)$/i;

/** Instructions split into readable steps, dropping "STEP 1" style heading lines. */
export const mealSteps = (meal: MealDetail) =>
  meal.instructions
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !STEP_HEADING.test(line));

export const isHttpUrl = (url: string | null): url is string => url?.startsWith('http') ?? false;

export const toSummary = ({ id, name, thumbnailUrl }: MealSummary): MealSummary => ({ id, name, thumbnailUrl });
