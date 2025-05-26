import { Module } from '@nestjs/common';

import { IndicesService } from './indices.service';
import { IndicesController } from 'src/indices/indices.controller';
import { INDICES_MODEL, IndicesSchema } from 'src/schemas/indices.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { IndicesGateway } from 'src/indices/event.gateway';



@Module({
  imports: [
    MongooseModule.forFeature([
      { name: INDICES_MODEL, schema: IndicesSchema }
    ]),
  ],
  controllers: [IndicesController],
  providers: [IndicesService, IndicesGateway],


})
export class IndicesModule { }
