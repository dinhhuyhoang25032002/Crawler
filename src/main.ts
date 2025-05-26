import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
 
  app.enableCors()
  app.setGlobalPrefix('v1/api')
  const config = new DocumentBuilder()
    .setTitle('Crawler  API')
    .setDescription('The Crawler API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/v1/api', app, document);
  await app.listen(process.env.PORT ?? 3000, () => {
    console.log(`Server is running on port: ${process.env.PORT ?? 3000}`)
  });
}
bootstrap();
