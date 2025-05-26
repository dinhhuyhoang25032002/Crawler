import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({

    timestamps: true
})
export class Indices extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    price: number;

    @Prop({ required: true })
    open: number;
    @Prop({ required: true })
    previousClose: number;

    @Prop({ required: true })
    dayHigh: number;

    @Prop({ required: true })
    dayLow: number;

    @Prop({ required: true })
    changePercentage: number;

    @Prop({ required: true })
    timestamp: number
}

export const IndicesSchema = SchemaFactory.createForClass(Indices);
export const INDICES_MODEL = Indices.name;

IndicesSchema.index({ name: 1 }, { name: "INDEX_INDICE" })