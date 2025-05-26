

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from "socket.io"
import { Model } from 'mongoose';
import { Indices, INDICES_MODEL } from 'src/schemas/indices.schema';
@WebSocketGateway(80,
    {
        namespace: 'indices',
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            allowedHeaders: ['X-API-KEY', 'Content-Type'],
            credentials: true,
        }
    }
)

export class IndicesGateway {
    constructor(
        @InjectModel(INDICES_MODEL)
        private readonly indicesModel: Model<Indices>,
    ) { }
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('message')
    async handleSubscribe(@MessageBody() data: { name: string }) {
        const { name } = data
        const indice = await this.handleGetIndiceByName(name)
        this.server.emit("onMessage", { data: indice })
    }

    async handleEmitData(data: any) {
        if ("name" in data) {
            this.server.emit(data.name, data);
        }
    }

    async handleGetIndiceByName(name: string) {
        const data = await this.indicesModel.find({
            name: name
        }).sort({ timestamp: -1 }).limit(8).lean().exec();

        if (data.length === 0) {
            return {
                status: HttpStatus.NOT_FOUND,
                message: "Not Found Data Analyst!"
            }
        }

        const average = data.reduce((pre, curr) => pre + curr.previousClose, 0) / data.length
        const itemLatest = data[0];
        const diffPercent = ((itemLatest.price - average) / average) * 100
        const res = {
            status: HttpStatus.OK,
            price: itemLatest.price,
            name: itemLatest.name,
            analystValue: diffPercent,
        }
        if (diffPercent > 5) {
            return {
                ...res,
                message: "Khuyến nghị bán"
            }
        }
        if (diffPercent < 5) {
            return {
                ...res,
                message: "Khuyến nghị mua"
            }
        }
        return {
            ...res,
            message: "Không khuyến nghị"
        }
    }
}