import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import { AppModule, ObserveInstrument } from './app.module.js';

/**
 * Punto de entrada principal de la aplicación.
 *
 * Inicializa NestJS y levanta el servidor HTTP.
 *
 * @returns {Promise<void>}
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  /**
   * Configuración principal de la documentación OpenAPI.
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Example API')
    .setDescription(
      'API de ejemplo para entrenamiento de NestJS.',
    )
    .setVersion('1.0.0')
    .build();

  /**
   * Genera el documento OpenAPI a partir
   * de los controllers y endpoints registrados.
   */
  const documentFactory = () =>
    SwaggerModule.createDocument(
      app,
      swaggerConfig,
    );

  /**
   * Expone Swagger UI en:
   *
   * http://localhost:5002/api
   */
  SwaggerModule.setup(
    'api',
    app,
    documentFactory,
  );
  await app.listen(process.env.PORT ?? 5002);
}
await bootstrap();
