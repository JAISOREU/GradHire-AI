import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Gradture API')
  .setDescription('Backend API for the Gradture platform')
  .setVersion('0.1.0')
  .addBearerAuth()
  .addTag('auth', 'Authentication endpoints')
  .addTag('jobs', 'Job listings and management')
  .addTag('applications', 'Job applications')
  .addTag('notifications', 'User notifications')
  .addTag('messages', 'Messaging between users')
  .addTag('resumes', 'Resume upload and parsing')
  .addTag('settings', 'User settings and preferences')
  .addTag('companies', 'Company profiles')
  .addTag('admin', 'Admin-only endpoints')
  .build();

export const setupSwagger = (app: any) => {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
};
