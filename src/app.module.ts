import { Module, } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IndicesModule } from './indices/indices.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot(
      {
        isGlobal: true,
        expandVariables: true,
        envFilePath: `.env.${process.env.NODE_ENV}.local`,
      }
    ),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(
      process.env.URL_DATABASE || "mongodb://localhost:27017/indices", {
      connectionFactory: (connection) => {
        {
          const { host, port, name } = connection
          connection && console.log("Connect Database successfully: ", `mongodb://${host}:${port}/${name}`);
        }
        return connection
      }
    }), IndicesModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
