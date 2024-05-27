import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Post, Res } from "@nestjs/common";
import { getPaymentLinkDto } from "./dto/payment.dto";
import { PaymentService } from "./payment.service";
import axios from "axios";
import { json } from "stream/consumers";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { config } from "dotenv";
import * as process from "process";

config();

@Controller("payment")
export class PaymentController {
  constructor(private readonly prismaService: PrismaService, private jwt: JwtService) {
  }

  baseUrl = "esoterium.payform.ru";
  frontUrl = "https://esoterium.su";
  urlPayment = this.baseUrl || "demo.payform.ru";
  secretKey = process.env.PAYMENT_KEY || "";

  prices = {
    "Diagnost": {
      price: "7500",
      title: "Диагностика"
    },
    "DiagnostPlusCorr": {
      title: "Диагностика+коррекция+подарок",
      price: "15000"
    },
    "test": {
      title: "Тест",
      price: "500"
    }
  };
  title = "Доступы";
  urlSuccess = `${this.frontUrl}/payment/success`;
  urlError = `${this.frontUrl}/payment/error`;

  @Post("getPaymentToken")
  async getPaymentToken(@Body() { token }: { token: string }) {

    const paymentUser = await this.prismaService.paymentTokens.findFirst({
      where: {
        id: token
      }
    });
    if (!paymentUser) {
      throw new NotFoundException("Not found");
    }
    return paymentUser;
  }

  @Post("createPayment")
  async createPayment(@Body() res) {
    console.log("createPayment", res);

    try {
      const payment = await this.prismaService.payment.create({
        data: {
          json: JSON.stringify(res)
        }
      });
      return payment;
    } catch (err) {
      throw new InternalServerErrorException("Internal server error");
    }
  }

  @Post("getPaymentInfoByPayform_order_id")
  async getPaymentInfoByPayform_order_id(@Body() { token }: { token: string }){
    try {
      const payment = this.prismaService.payment.findFirst({
        where: {
          paymentToken: token
        }
      })

      if(!payment){
        return ''
      }

      const js = JSON.parse(payment.json)

      if(js.payment_status === 'success'){
          return payment
      }

    }catch (err){
      throw new InternalServerErrorException("Internal server error");
    }
  }

  @Get("getPaymentList")
  async getPaymentList() {
    return await this.prismaService.payment.findMany();
  }

  @Post("deleteToken")
  async deleteToken(@Body() { token }: { token: string }) {
    try {
      const paymentUser = await this.prismaService.paymentTokens.delete({
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

  @Post("getPaymentLink")
  async getPaymentLink(@Body() dto: getPaymentLinkDto) {
    const studentToAssign = await this.prismaService.user.findFirst({
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
      throw new NotFoundException("Нет доступных херомантов");
    }

    const token = await this.prismaService.paymentTokens.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        typeProduct: dto.typeProduct
      }
    });

    if (!token) {
      const err = "Токен для оплаты не был сгенерирован";
      await this.prismaService.logs.create({
        data: {
          message: err,
          email: dto.email,
          isError: true,
          type: "paymentTokenCreate"
        }
      });
      throw new NotFoundException(err);
    }

    let res;

    let paid_content = JSON.stringify({
      email: dto.email,
      phone: dto.phone
    });
    const product = this.prices[dto.typeProduct];

    try {

      if (!product?.price) {
        throw new NotFoundException("Продукт не найден.");
      }


      res = await axios.get(`https://${this.urlPayment}/?order_id=${token.id}&demo_mode=1&customer_phone=${dto.phone}&acquiring=sbrf&customer_email=${dto.email}&secret_key=${this.secretKey}&products[0][price]=${product.price}&products[0][quantity]=1&products[0][name]=${product.title}&customer_extra=${product.title}&do=link&urlError=${this.urlError}&urlSuccess=${this.urlSuccess}&paid_content=${paid_content}`);
    } catch (err) {
      throw new NotFoundException(err);
    }

    if (!res?.data) {
      await this.prismaService.logs.create({
        data: {
          message: "Ссылка на оплату не может быть создана.",
          email: dto.email,
          isError: true,
          type: "getPaymentLink"
        }
      });
      throw new NotFoundException("Ссылка на оплату не может быть создана.");
    }


    return {
      link: res.data,
      product: product,
      token: token.id
    };
  }
}
