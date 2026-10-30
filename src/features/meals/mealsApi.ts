import { ApiClient, RequestOptions } from '@/core/network/apiClient';
import { failure, Result, success } from '@/core/network/result';

import { MealCategory, MealDetail, MealSummary } from './models';

type Json = Record<string, unknown>;

/** TheMealDB flattens ingredients into `strIngredient1..20` / `strMeasure1..20`. */
const MAX_INGREDIENTS = 20;

/**
 * TheMealDB endpoints, decoded into domain models at the boundary. "No results"
 * arrives as `{"meals": null}`, which becomes an empty list.
 */
export class MealsApi {
  constructor(private readonly client: ApiClient) {}

  async categories(options?: RequestOptions): Promise<Result<MealCategory[]>> {
    return this.decode(await this.client.get('categories.php', options), (json) =>
      list(json, 'categories').map((item) => ({
        id: text(item, 'idCategory') ?? fail('idCategory'),
        name: text(item, 'strCategory') ?? fail('strCategory'),
        thumbnailUrl: text(item, 'strCategoryThumb') ?? fail('strCategoryThumb'),
      })),
    );
  }

  async mealsByCategory(category: string, options?: RequestOptions): Promise<Result<MealSummary[]>> {
    return this.decode(await this.client.get('filter.php', { ...options, query: { c: category } }), (json) =>
      list(json, 'meals').map(decodeSummary),
    );
  }

  async search(query: string, options?: RequestOptions): Promise<Result<MealSummary[]>> {
    return this.decode(await this.client.get('search.php', { ...options, query: { s: query } }), (json) =>
      list(json, 'meals').map(decodeSummary),
    );
  }

  async lookup(id: string, options?: RequestOptions): Promise<Result<MealDetail>> {
    return this.firstMeal(await this.client.get('lookup.php', { ...options, query: { i: id } }));
  }

  async random(options?: RequestOptions): Promise<Result<MealDetail>> {
    return this.firstMeal(await this.client.get('random.php', options));
  }

  private firstMeal(result: Result<unknown>): Result<MealDetail> {
    const decoded = this.decode(result, (json) => list(json, 'meals').map(decodeMealDetail));
    if (!decoded.ok) {
      return decoded;
    }
    const [meal] = decoded.data;
    return meal ? success(meal) : failure({ kind: 'notFound' });
  }

  private decode<T>(result: Result<unknown>, decoder: (json: Json) => T): Result<T> {
    if (!result.ok) {
      return result;
    }
    try {
      return success(decoder(asObject(result.data)));
    } catch {
      return failure({ kind: 'parsing' });
    }
  }
}

export function decodeMealDetail(json: Json): MealDetail {
  const ingredients = [];
  for (let index = 1; index <= MAX_INGREDIENTS; index++) {
    const name = text(json, `strIngredient${index}`);
    if (name) {
      ingredients.push({ name, measure: text(json, `strMeasure${index}`) ?? '' });
    }
  }
  return {
    ...decodeSummary(json),
    category: text(json, 'strCategory'),
    area: text(json, 'strArea'),
    instructions: text(json, 'strInstructions') ?? '',
    ingredients,
    tags: (text(json, 'strTags') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    youtubeUrl: text(json, 'strYoutube'),
    sourceUrl: text(json, 'strSource'),
  };
}

function decodeSummary(json: Json): MealSummary {
  return {
    id: text(json, 'idMeal') ?? fail('idMeal'),
    name: text(json, 'strMeal') ?? fail('strMeal'),
    thumbnailUrl: text(json, 'strMealThumb') ?? fail('strMealThumb'),
  };
}

function asObject(value: unknown): Json {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Expected a JSON object');
  }
  return value as Json;
}

function list(json: Json, key: string): Json[] {
  const value = json[key];
  return Array.isArray(value) ? value.map(asObject) : [];
}

function text(json: Json, key: string): string | null {
  const value = json[key];
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function fail(field: string): never {
  throw new TypeError(`Missing ${field}`);
}
