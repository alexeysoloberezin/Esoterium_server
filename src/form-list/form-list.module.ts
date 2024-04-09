import { Module } from '@nestjs/common';
import {FormListController} from "./form-list.controller";
import {FormListService} from "./form-list.service";


@Module({
    controllers: [FormListController],
    providers: [FormListService],
})
export class FormListModule {}
