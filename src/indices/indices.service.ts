import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Indices, INDICES_MODEL } from 'src/schemas/indices.schema';

import { IndicesGateway } from 'src/indices/event.gateway';


@Injectable()
export class IndicesService {

    constructor(
        @InjectModel(INDICES_MODEL)
        private readonly indicesModel: Model<Indices>,

        private readonly marketGateway: IndicesGateway
    ) { }
    async handleUpdateIndicesDowJonesAndNasdaq() {
        const FMP_URL = process.env.FMP_URL;
        const API_KEY_FMP = process.env.API_KEY_FMP
        try {
            const symbols = ['NVDA', 'AAPL'];
            const urls = symbols.map(symbol => `${FMP_URL}/stable/quote?symbol=${symbol}&apikey=${API_KEY_FMP}`);
            const [resDowJones, resNasdaq] = await Promise.all(
                urls.map(url => fetch(url).then(res => res.json()))
            );
            await this.indicesModel.insertMany([
                { ...resDowJones[0] },
                { ...resNasdaq[0] },
            ])
            const names = [resDowJones[0].name, resNasdaq[0].name];
            const dataArray = await Promise.all(
                names.map(name => this.handleGetIndiceByName(name))
            );

            await Promise.all(
                dataArray.map(data => this.marketGateway.handleEmitData(data))
            );

        } catch (error) {
            throw new Error(error)
        }
    }

    async handleUpdateIndicesIndicesSP500() {
        const FMP_URL = process.env.FMP_URL;
        const API_KEY_FMP = process.env.API_KEY_FMP
        try {
            const res = await (await fetch(`${FMP_URL}/stable/quote?symbol=^GSPC&apikey=${API_KEY_FMP}`)).json()
            await this.indicesModel.create({
                ...res[0]
            })
        } catch (error) {
            throw new Error(error)
        }
    }

    async handleGetIndices() {
        const data = await this.indicesModel.find().lean().exec();

        if (data.length === 0) {
            return {
                status: HttpStatus.NOT_FOUND,
                data
            }
        }
        return {
            status: HttpStatus.OK,
            data
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
