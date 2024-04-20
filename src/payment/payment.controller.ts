import { Body, Controller, Get, InternalServerErrorException, NotFoundException, Post, Res } from "@nestjs/common";
import { getPaymentLinkDto } from "./dto/payment.dto";
import { PaymentService } from "./payment.service";
import axios from "axios";
import { json } from "stream/consumers";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";


@Controller("payment")
export class PaymentController {
  constructor(private readonly prismaService: PrismaService,   private jwt: JwtService,) {
  }

  urlPayment =   "esoterium.payform.ru" || 'demo.payform.ru';
  secretKey =  "2fe3a644a2173535c0f1e68c18dc54c4f74932e9cfc585b9d1de689716018971" || '';

  price = "500";
  title = "Обучающие материалы";
  urlSuccess = "http://localhost:3000/payment/success";
  urlError = "http://localhost:3000/payment/error";

  @Post('getPaymentToken')
  async getPaymentToken(@Body() {token}: {token: string}) {
    const paymentUser = await this.prismaService.paymentTokens.findFirst({
      where: {
        id: token
      }
    });
    if(!paymentUser){
      throw new NotFoundException('Not found');
    }
    console.log('paymentUser', paymentUser);
    return paymentUser
  }

  @Post('deleteToken')
  async deleteToken(@Body() {token}: {token: string}) {
    try {
      const paymentUser = await this.prismaService.paymentTokens.delete({
        where: {
          id: token
        }
      });
      return paymentUser;
    } catch (error) {
      if (error?.code === 'P2025') {
        throw new NotFoundException('Token not found');
      }
      throw new InternalServerErrorException('Internal server error');
    }
  }

  @Post("getPaymentLink")
  async getPaymentLink(@Body() dto: getPaymentLinkDto) {
    const token = await this.prismaService.paymentTokens.create({ data: {
      email: dto.email,
      phone: dto.phone,
    }});

    if(!token){
      const err = 'Токен для оплаты не был сгенерирован'
      await this.prismaService.logs.create({
        data: {
          message: err,
          email: dto.email,
          isError: true,
          type: 'paymentTokenCreate'
        }
      });
      throw new NotFoundException(err);
    }

    console.log(dto);

    let res;

    let paid_content = JSON.stringify({
      email: dto.email,
      phone: dto.phone
    })

    try {
      res = await axios.get(`https://${this.urlPayment}/?order_id=${token.id}&customer_phone=${dto.phone}&acquiring=sbrf&customer_email=${dto.email}&secret_key=${this.secretKey}&demo_mode=1&products[0][price]=${this.price}&products[0][quantity]=1&products[0][name]=${this.title}&customer_extra=Полная оплата курса&do=link&urlError=${this.urlError}&urlSuccess=${this.urlSuccess}&paid_content=${paid_content}`);
    }catch (err){
      throw new NotFoundException(err);
    }

    if (!res?.data) {
      await this.prismaService.logs.create({
        data: {
          message: "Ссылка на оплату не может быть создана.",
          email: dto.email,
          isError: true,
          type: 'getPaymentLink'
        }
      });
      throw new NotFoundException("Ссылка на оплату не может быть создана.");
    }


    return {
      link: res.data,
      token: token.id
    };
  }
}
