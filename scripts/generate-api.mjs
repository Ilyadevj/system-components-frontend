import { resolve } from 'path';
import { generateApi } from 'swagger-typescript-api';

try {
  await generateApi({
    name: 'Api.ts',
    output: resolve(process.cwd(), './src/api'),
    url: 'http://localhost:8080/swagger/doc.json',
    httpClientType: 'axios',
  });
  console.log('API успешно сгенерировано в src/api/Api.ts');
} catch (error) {
  console.warn('Бэкенд на localhost:8080 недоступен для генерации OpenAPI. Используется актуальный клиент в src/api/Api.ts.');
}
