import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable graceful shutdown hooks (W-12)
  app.enableShutdownHooks();

  // CORS configuration (C-05)
  const corsOrigins = configService.get<string>('CORS_ORIGINS');
  let origin: boolean | string | string[] = true;

  if (corsOrigins) {
    const parsed = corsOrigins.split(',').map((o) => o.trim());
    origin = parsed.length === 1 && parsed[0] === '*' ? true : parsed;
  } else if (process.env.NODE_ENV === 'production') {
    logger.warn(
      'CORS_ORIGINS not set in production. Cross-origin requests will be rejected.',
    );
    origin = false;
  } else {
    // Development fallback origins
    origin = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ];
  }

  app.enableCors({
    origin,
    credentials: true,
  });

  // Global Exception Filter (W-08)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Global API Prefix (M-02)
  const apiPrefix = configService.get<string>('API_PREFIX');
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix, { exclude: ['health'] });
  }

  // Swagger / OpenAPI documentation (M-01)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Turganov Seller API')
    .setDescription(
      'Multi-store proxy API for Wildberries Seller services, marketplace orders, content, finances, and analytics.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const docsPath = apiPrefix ? `${apiPrefix}/docs` : 'docs';
  SwaggerModule.setup(docsPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);
  logger.log(
    `Application is running on: http://localhost:${port}${apiPrefix ? `/${apiPrefix}` : ''}`,
  );
  logger.log(`Swagger docs available at: http://localhost:${port}/${docsPath}`);
}

void bootstrap();
