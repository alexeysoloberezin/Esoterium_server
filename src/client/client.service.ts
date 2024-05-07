import { Body, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDTO } from "./dto/create.dto";

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async createClient (clientData: CreateClientDTO){
    const client = await this.prisma.client.create({
      data: clientData,
    });

    return client
  }

  async deleteToken(token: string) {
    try {
      const paymentUser = await this.prisma.paymentTokens.delete({
        where: {
          id: token
        }
      });
      console.log('token was deletd', paymentUser.id);
      return paymentUser;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Token not found');
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  async clearQueueAndDeleteClients() {
    try {
      // Выключаем очередь у всех студентов
      await this.prisma.user.updateMany({
        where: {
          role: 'student',
        },
        data: {
          queue: false,
        },
      });

      // Находим и удаляем всех клиентов
      const deletedClients = await this.prisma.client.deleteMany();

      return {
        message: 'Queue cleared and all clients deleted',
        deletedClientsCount: deletedClients.count,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to clear queue and delete clients');
    }
  }

  async createClientAndAssignToStudent(clientData: CreateClientDTO) {
    // Создаем нового клиента
    const client = await this.prisma.client.create({
      data: {
        email: clientData.email,
        phone: clientData.phone,
      },
    });

    const removedToken = this.deleteToken(clientData.id)

    if(!removedToken){
      throw new Error('Token not deleted');
    }

    // Находим первого студента с включенным queue
    const studentToAssign = await this.prisma.user.findFirst({
      where: {
        role: 'student',
        queue: true,
        telegram: {
          not: null, // Фильтр для учета только тех, у кого есть telegram
        },
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
        telegram: {
          not: null, // Фильтр для учета только тех, у кого есть telegram
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
      student: {
        telegram: updatedStudent.telegram,
        id: updatedStudent.id
      },
    };
  }
}
