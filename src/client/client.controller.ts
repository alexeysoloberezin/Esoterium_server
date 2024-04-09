import { Body, Controller, Post, Request } from "@nestjs/common";
import { ClientService } from "./client.service";
import { CreateClientDTO } from "./dto/create.dto";

@Controller('client')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post('create')
  async profileIsCorrect(@Body() dto: CreateClientDTO) {
    return this.clientService.createClientAndAssignToStudent(dto);
  }
}
