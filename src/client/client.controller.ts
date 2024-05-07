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

  @Post('create')
  async profileIsCorrect(@Body() dto: CreateClientDTO) {
    return this.clientService.createClientAndAssignToStudent(dto);
  }

  @Post('restartClients')
  @UseGuards(AuthGuard, AdminGuard)
  async restartClients(){
    return this.clientService.clearQueueAndDeleteClients();
  }
}
