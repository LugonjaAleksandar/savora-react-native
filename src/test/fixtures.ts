import { Result, success } from '@/core/network/result';
import { MealsRepository } from '@/features/meals/mealsRepository';
import { MealCategory, MealDetail, MealSummary } from '@/features/meals/models';

export const summary: MealSummary = {
  id: '52772',
  name: 'Teriyaki Chicken Casserole',
  thumbnailUrl: 'https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg',
};

export const categories: MealCategory[] = [
  { id: '1', name: 'Beef', thumbnailUrl: 'https://www.themealdb.com/images/category/beef.png' },
  { id: '2', name: 'Chicken', thumbnailUrl: 'https://www.themealdb.com/images/category/chicken.png' },
];

export const detailJson = {
  idMeal: '52772',
  strMeal: '  Teriyaki Chicken Casserole ',
  strMealThumb: summary.thumbnailUrl,
  strCategory: 'Chicken',
  strArea: '',
  strInstructions: 'STEP 1\r\nPreheat oven to 350F.\r\n\r\n2.\r\nCombine soy sauce and water.',
  strTags: 'Meat, Casserole,',
  strYoutube: 'https://www.youtube.com/watch?v=4aZr5hZXP_s',
  strSource: ' ',
  strIngredient1: 'soy sauce',
  strMeasure1: '3/4 cup',
  strIngredient2: 'water',
  strMeasure2: null,
  strIngredient3: '',
  strMeasure3: '',
};

export const categoriesJson = {
  categories: [
    {
      idCategory: '1',
      strCategory: 'Beef',
      strCategoryThumb: categories[0]!.thumbnailUrl,
      strCategoryDescription: 'Beef.',
    },
  ],
};

export const listingJson = {
  meals: [{ idMeal: summary.id, strMeal: summary.name, strMealThumb: summary.thumbnailUrl }],
};

/** A `fetch` that replays queued responses (or rejections) and records requested URLs. */
export function stubFetch(...replies: (object | number | Error | string)[]) {
  const urls: string[] = [];
  const fetchFn = jest.fn(async (input: RequestInfo | URL) => {
    urls.push(String(input));
    const reply = replies.shift() ?? new TypeError('Network request failed');
    if (reply instanceof Error) {
      throw reply;
    }
    if (typeof reply === 'number') {
      return new Response('{}', { status: reply });
    }
    return new Response(typeof reply === 'string' ? reply : JSON.stringify(reply), { status: 200 });
  });
  return { fetchFn: fetchFn as unknown as typeof fetch, urls };
}

export class FakeMealsRepository implements MealsRepository {
  categoriesResult: Result<MealCategory[]> = success(categories);
  mealsResult: Result<MealSummary[]> = success([summary]);
  requestedCategories: string[] = [];
  searchedQueries: string[] = [];

  async categories() {
    return this.categoriesResult;
  }

  async mealsInCategory(category: string) {
    this.requestedCategories.push(category);
    return this.mealsResult;
  }

  async search(query: string) {
    this.searchedQueries.push(query);
    return this.mealsResult;
  }

  async meal(): Promise<Result<MealDetail>> {
    return success({
      ...summary,
      category: null,
      area: null,
      instructions: '',
      ingredients: [],
      tags: [],
      youtubeUrl: null,
      sourceUrl: null,
    });
  }

  randomMeal() {
    return this.meal();
  }
}
