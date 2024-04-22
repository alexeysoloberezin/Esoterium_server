import {Body, Controller, Get, Post, Request, UseGuards} from '@nestjs/common';
import {FormListService} from "./form-list.service";
import {ApiBadRequestResponse, ApiCreatedResponse} from "@nestjs/swagger";
import {TaskDTO} from "../tasks/dto";
import {CreateFormListDto} from "./formListDto";
import {AuthGuard} from "../auth/auth.guard";

@Controller('form-list')
export class FormListController {
    constructor(private readonly formListService: FormListService) {}

    @Get('/test')
    async test() {
        return {
            corsUrl: ''
        }
    }

    @Get()
    @UseGuards(AuthGuard)
    async findAll() {
        return this.formListService.findAll();
    }


    @Post('new')
    @ApiBadRequestResponse({ description: 'Validation error' })
    @ApiCreatedResponse({ description: 'Your form has been created' })
    async create(@Body() dto: CreateFormListDto){
        return this.formListService.create(dto)
    }

    @Post('delete')
    @ApiBadRequestResponse({ description: 'Validation error' })
    @ApiCreatedResponse({ description: 'Your formlist has been created' })
    async deleteFormList(@Body() dto: {ids: string[]}){
        return this.formListService.deleteManyByIds(dto.ids)
    }

    @Post('deleteByDates')
    @ApiBadRequestResponse({ description: 'Validation error' })
    @ApiCreatedResponse({ description: 'Your items was deleted' })
    async deleteByDates(@Body() dto: {from: string, to: string}){
        return this.formListService.deleteByDates(dto.from, dto.to)
    }


    @Post('deleteAll')
    @ApiBadRequestResponse({ description: 'Validation error' })
    @ApiCreatedResponse({ description: 'Your items was deleted' })
    async deleteAll(){
        return this.formListService.deleteAll()
    }
}
