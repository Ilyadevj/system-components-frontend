import { COMPONENTS_MOCK } from "./mock";

export interface SystemComponent {
  id: number;
  name: string;
  priority: number;
  grouping: string;
  responseTimeMs: number;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  likesCount: number;
}

export interface ComponentsResult {
  resultCount: number;
  results: SystemComponent[];
}

/**
 * Получение компонентов по имени/фильтру через собственный API
 * с автоматическим fallback на mock-объекты при отсутствии связи с бэкендом.
 */
export const getComponentsByName = async (name = ""): Promise<ComponentsResult> => {
  try {
    const res = await fetch(`/api/system-components?search=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("API network error");
    return await res.json();
  } catch {
    const filtered = COMPONENTS_MOCK.results.filter((item) =>
      item.name.toLowerCase().includes(name.toLowerCase())
    );
    return {
      resultCount: filtered.length,
      results: filtered.length ? filtered : COMPONENTS_MOCK.results,
    };
  }
};

/**
 * Получение одного компонента по ID через API или mock-коллекцию.
 */
export const getComponentById = async (
  id: number | string
): Promise<SystemComponent | undefined> => {
  try {
    const res = await fetch(`/api/system-components/${id}`);
    if (!res.ok) throw new Error("API network error");
    return await res.json();
  } catch {
    return COMPONENTS_MOCK.results.find((item) => String(item.id) === String(id));
  }
};
