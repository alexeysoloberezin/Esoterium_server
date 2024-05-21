import {Injectable, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {CreateFormListDto} from "./formListDto";
import logError from "../logs/logError";

@Injectable()
export class FormListService {
  constructor(private readonly prismaService: PrismaService) {
  }

  async findAll() {
    return await this.prismaService.formList.findMany()
  }

  async create(data: CreateFormListDto) {
    try {
      const res = await this.prismaService.formList.create({
        data
      })
      return res
    } catch (error) {
      console.error('Ошибка создания пользователя: ', error.message);
      logError(error);
    }
  }

  async deleteManyByIds(ids: string[]) {
    const deleteResult = await this.prismaService.formList.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    if (deleteResult.count === 0) {
      throw new NotFoundException('No records found for the given IDs');
    }

    return deleteResult;
  }

  async deleteByDates(from: string, to: string) {
    if (!from || !to) {
      throw new NotFoundException('Please provide both from and to dates');
    }

    try {
      const deleteResult = await this.prismaService.formList.deleteMany({
        where: {
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
      });
      return deleteResult
    } catch (error) {
      throw new NotFoundException('No records found for the given dates');
    }
  }

  async deleteAll() {
    return await this.prismaService.formList.deleteMany();
  }
}