import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import type { SystemComponent, ComponentsResult } from "../modules/componentsApi";

export interface FilterParams {
  search?: string;
  grouping?: string;
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
        ...config,
      });
    },

    /**
     * GET /api/system-components/:id
     * Получение детальной информации по компоненту
     */
    systemComponentsDetail: (
      id: number | string,
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<SystemComponent>> => {
      return this.instance.get<SystemComponent>(`/api/system-components/${id}`, config);
    },

    /**
     * POST /api/system-components
     * Создание/публикация нового компонента
     */
    systemComponentsCreate: (
      data: Partial<SystemComponent>,
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<SystemComponent>> => {
      return this.instance.post<SystemComponent>("/api/system-components", data, config);
    },

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
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<{ likesCount: number }>> => {
      return this.instance.post(`/api/system-components/${id}/like`, {}, config);
    },
  };
}

export default Api;
