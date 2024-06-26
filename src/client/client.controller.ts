import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateClientDTO } from "./dto/create.dto";
import { AuthGuard } from "../auth/auth.guard";
import { AdminGuard } from "../auth/admin.guard";

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post('createClient')
  async createClient(@Body() dto: CreateClientDTO) {
    return this.clientService.createClient(dto);
  }

  @Post('clearPaymentList')
  async clearPaymentList(){
    return this.clientService.clearPaymentList()
  }

  @Post('paymentsByEmailAndPhone')
  async paymentsByEmailAndPhone(@Body() {email, phone}: {email: string, phone: string}){
    return this.clientService.paymentsByEmailAndPhone(email, phone)
  }

  @Post('create')
  async profileIsCorrect(@Body() dto) {
    return this.clientService.createClientAndAssignToStudent(dto);
  }

  @Post('checkPhone')
  async checkPhone(@Body() {email, phone}: {email: string, phone: string}){
    return this.clientService.checkPhone(email, phone)
  }

  @Post('getPaymentsByEmail')
  async getPaymentsByEmail(@Body() {email}: {email: string}) {
    return this.clientService.paymentsByEmail(email);
  }

  @Post('restartClients')
  @UseGuards(AuthGuard, AdminGuard)
  async restartClients(){
    return this.clientService.clearQueueAndDeleteClients();
  }
}
