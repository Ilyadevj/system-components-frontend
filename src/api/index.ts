import { Api } from "./Api";

// Инстанс сгенерированного API-клиента для работы через axios и Vite Proxy
export const api = new Api({
  baseURL: "",
});

export * from "./Api";
