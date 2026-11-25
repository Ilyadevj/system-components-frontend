import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { ComponentsResult } from "../modules/componentsApi";

export interface FilterParams {
  search?: string;
  groups?: string[];
  priority?: string | number;
}

export interface ApiConfig {
  baseURL?: string;
  axiosInstance?: AxiosInstance;
}

export class Api {
  private instance: AxiosInstance;

  constructor(config?: ApiConfig) {
    this.instance =
      config?.axiosInstance ||
      axios.create({
        baseURL: config?.baseURL ?? "",
        timeout: 10000,
      });
  }

  public systemComponents = {
    systemComponentsList: (
      params?: FilterParams,
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<ComponentsResult>> => {
      return this.instance.get<ComponentsResult>("/api/system-components", {
        params,
        paramsSerializer: { indexes: null },
        ...config,
      });
    },

    systemComponentsDraft: () =>
      this.instance.get<unknown>("/api/system-components/draft"),

    systemComponentsCreate: (data: FormData) =>
      this.instance.post<unknown>("/api/system-components", data),

    systemComponentsPublish: (
      id: number,
      data: { description: string; grouping: string; priority: number }
    ) => this.instance.put<unknown>(`/api/system-components/${id}`, data),

    /**
     * DELETE /api/system-components/:id
     * Удаление компонента
     */
    systemComponentsDelete: (
      id: number | string,
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<{ success: boolean; id: number | string }>> => {
      return this.instance.delete(`/api/system-components/${id}`, config);
    },

    /**
     * POST /api/system-components/:id/like
     * Поставить лайк компоненту
     */
    systemComponentsLike: (
      id: number | string,
      like: 0 | 1
    ): Promise<AxiosResponse<{ likes_count: number; is_liked: number }>> => {
      return this.instance.post(`/api/system-components/${id}/like`, { like });
    },
  };
}

export default Api;
