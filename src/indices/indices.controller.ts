import { Controller, Get, Param } from "@nestjs/common"
import { Cron } from "@nestjs/schedule";

import { IndicesService } from "src/indices/indices.service"

@Controller("indices")
export class IndicesController {
    constructor(private readonly indicesService: IndicesService) { }

    @Cron("3 00 3 * * 1-6", {
        name: 'update-indices',
        timeZone: 'Asia/Ho_Chi_Minh',
    })
    async updateIndicesDowJonesAndNasdaq() {
        return this.indicesService.handleUpdateIndicesDowJonesAndNasdaq();
    }

    @Cron("41 57 3 * * 1-6", {
        name: 'update-indices',
        timeZone: 'Asia/Ho_Chi_Minh',
    })
    async updateIndicesSP500() {
        return this.indicesService.handleUpdateIndicesIndicesSP500();
    }


    @Get()
    async getIndices() {
        return this.indicesService.handleGetIndices();
    }

    @Get(":name")
    async getIndiceByName(
        @Param("name") name: string
    ) {
        return this.indicesService.handleGetIndiceByName(name)
    }
}