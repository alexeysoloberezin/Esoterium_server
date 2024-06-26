import { Body, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateClientDTO } from "./dto/create.dto";

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {
  }

  async createClient(clientData: CreateClientDTO) {
    const client = await this.prisma.client.create({
      data: clientData
    });

    return client;
  }

  async deleteToken(token: string) {
    try {
      const paymentUser = await this.prisma.paymentTokens.delete({
        where: {
          id: token
        }
      });
      return paymentUser;
    } catch (error) {
      if (error?.code === "P2025") {
        throw new NotFoundException("Token not found");
      }
      throw new InternalServerErrorException("Internal server error");
    }
  }

  async checkPhone(email, phone){
    const payment: any = await this.prisma.payment.findMany({
      where: {
        customerEmail: email
      }
    })

    if(!Array.isArray(payment) || payment.length === 0){
      return {
        message: 'Not found',
        count: 0
      }
    }

    let correctPhone = false

    payment.forEach(el => {
      const json = el.json ? JSON.parse(el.json) : null;

      console.log('1');
      if (json) {
        const jsonPhoneLast4 = json.customer_phone.slice(-4);
        const phoneLast4 = phone.slice(-4);
        console.log('jsonPhoneLast4', jsonPhoneLast4);
        console.log('phoneLast4', phoneLast4);

        if (jsonPhoneLast4 === phoneLast4) {
          correctPhone = true;
        }
      }
    })

    if(!correctPhone){
      return {
        message: "Номер не найден!",
        status: 'error',
        paymentList: []
      }
    }

    return {
      message: "Подтвержение пройдено!",
      status: 'success',
      paymentList: payment
    }
  }

  async paymentsByEmail(email){
    const payment: any = await this.prisma.payment.findMany({
      where: {
        customerEmail: email
      }
    })

    if(!Array.isArray(payment) || payment.length === 0){
      return {
        message: 'Not found',
        count: 0
      }
    }

    return {
      email: email,
      message: `Найдено оплат: ${payment.length}`,
      count: payment.length
    }
  }

  async paymentsByEmailAndPhone(email, phone){
    return  await this.prisma.payment.findMany({
      where: {
        customerEmail: email
      }
    })
  }

  async clearQueueAndDeleteClients() {
    try {
      // Выключаем очередь у всех студентов
      await this.prisma.user.updateMany({
        where: {
          role: "student"
        },
        data: {
          queue: true
        }
      });

      // Находим и удаляем всех клиентов
      const deletedClients = await this.prisma.client.deleteMany();

      return {
        message: "Queue cleared and all clients deleted",
        deletedClientsCount: deletedClients.count
      };
    } catch (error) {
      throw new InternalServerErrorException("Failed to clear queue and delete clients");
    }
  }

  async clearPaymentList(){
    try {
      return await this.prisma.payment.deleteMany();
    }catch (err){
      throw new Error("Error");
    }
  }

  async createClientAndAssignToStudent(res) {
    console.log('createClientAndAssignToStudent', res);

    const demoMode = res;

    if (res.payment_status === "success" || res.payment_status === "order_approved" ) {
      const findPayment = await this.prisma.payment.findFirst({
        where: {
          paymentToken: res.order_num
        }
      })

      if(findPayment){
        throw new Error("Payment Already Registered");
      }

      // Создаем нового клиента
      const client = await this.prisma.client.create({
        data: {
          email: res.customer_email,
          phone: res.customer_phone,
          typeProduct: res.customer_extra
        }
      });

      // const removedToken = this.deleteToken(clientData.id);
      //
      // if (!removedToken) {
      //   throw new Error("Token not deleted");
      // }

      // Находим первого студента с включенным queue
      const studentToAssign = await this.prisma.user.findFirst({
        where: {
          role: "student",
          queue: true,
          telegram: {
            not: null // Фильтр для учета только тех, у кого есть telegram
          },
          atv: true
        },
        orderBy: {
          createdAt: "asc" // Сортируем по дате создания для определения порядка
        }
      });

      if (!studentToAssign) {
        throw new Error("No students available");
      }


      // Присваиваем клиента студенту и выключаем queue
      const updatedStudent = await this.prisma.user.update({
        where: {
          id: studentToAssign.id
        },
        data: {
          clients: {
            connect: {
              id: client.id
            }
          },
          queue: false // Выключаем queue
        }
      });

      // Проверяем, является ли студент последним в списке
      const isLastStudent = await this.prisma.user.findFirst({
        where: {
          role: "student",
          id: {
            not: studentToAssign.id // Исключаем текущего студента
          },
          telegram: {
            not: null // Фильтр для учета только тех, у кого есть telegram
          },
          atv: true,
          queue: true // Ищем других студентов с включенным queue
        },
        orderBy: {
          createdAt: "asc"
        }
      }) === null;

      // Если это последний студент, включаем queue для всех студентов
      if (isLastStudent) {
        await this.prisma.user.updateMany({
          where: {
            role: "student"
          },
          data: {
            queue: true // Включаем queue
          }
        });
      }

      const newClient = await this.prisma.client.findFirst({
        where: { id: client.id }
      });

      const payment = await this.prisma.payment.create({
        data: {
          json: JSON.stringify({
            ...res,
            client: newClient,
            student: {
              telegram: updatedStudent.telegram,
              id: updatedStudent.id
            }
          }),
          paymentToken: res.order_num,
          customerEmail: newClient.email
        }
      });

      return payment;
    }else{
      throw new Error("Bad Payment");
    }


  }
}
