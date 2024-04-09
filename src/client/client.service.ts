import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDTO } from "./dto/create.dto";

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async createClientAndAssignToStudent(clientData: CreateClientDTO) {
    // Создаем нового клиента
    const client = await this.prisma.client.create({
      data: clientData,
    });

    // Находим первого студента с включенным queue
    const studentToAssign = await this.prisma.user.findFirst({
      where: {
        role: 'student',
        queue: true,
      },
      orderBy: {
        createdAt: 'asc', // Сортируем по дате создания для определения порядка
      },
    });

    if (!studentToAssign) {
      throw new Error('No students available');
    }

    // Присваиваем клиента студенту и выключаем queue
    const updatedStudent = await this.prisma.user.update({
      where: {
        id: studentToAssign.id,
      },
      data: {
        clients: {
          connect: {
            id: client.id,
          },
        },
        queue: false, // Выключаем queue
      },
    });

    // Проверяем, является ли студент последним в списке
    const isLastStudent = await this.prisma.user.findFirst({
      where: {
        role: 'student',
        id: {
          not: studentToAssign.id, // Исключаем текущего студента
        },
        queue: true, // Ищем других студентов с включенным queue
      },
      orderBy: {
        createdAt: 'asc',
      },
    }) === null;

    // Если это последний студент, включаем queue для всех студентов
    if (isLastStudent) {
      await this.prisma.user.updateMany({
        where: {
          role: 'student',
        },
        data: {
          queue: true, // Включаем queue
        },
      });
    }

    const newClient = await this.prisma.client.findFirst({
      where: { id: client.id }
    });

    return {
      client: newClient,
      student: updatedStudent,
    };
  }
}
