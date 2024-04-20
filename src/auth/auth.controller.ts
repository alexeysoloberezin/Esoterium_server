import { Body, Controller, Get, NotFoundException, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from './auth.service';
import { SignInDTO, SignUpDTO } from './dto';
import * as argon from 'argon2';
import {
  ApiAcceptedResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import {AuthGuard} from "./auth.guard";
import { AdminGuard } from "./admin.guard";
import { User } from "@prisma/client";
import { UpdateProfileDTO } from "./dto/update.dto";

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('createAdmin')
  @ApiCreatedResponse({ description: 'Signup successful' })
  @ApiConflictResponse({ description: 'Email/username is already in taken' })
  async createAdmin(@Request() req, @Body() dto: SignUpDTO ) {
    const password = await argon.hash(dto.password);
    return this.authService.createAdmin({ ...dto, password });
  }

  @Post('createStudent')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCreatedResponse({ description: 'Успешное создание' })
  async createStudent(@Request() req, @Body() dto: SignUpDTO ) {
    const password = await argon.hash(dto.password);
    return this.authService.createStudent({ ...dto, password });
  }

  @Post('createClient')
  @ApiCreatedResponse({ description: 'Успешно создан' })
  @ApiConflictResponse({ description: 'Email уже занят' })
  async createClient(@Request() req, @Body() dto: SignUpDTO ) {
    const password = await argon.hash(dto.password);
    return this.authService.createStudent({ ...dto, password });
  }

  @Post('deleteStudent')
  @UseGuards(AuthGuard, AdminGuard)
  @ApiCreatedResponse({ description: 'Signup successful' })
  @ApiConflictResponse({ description: 'Email/username is already in taken' })
  async deleteStudent(@Body() {id}: {id: string}) {
    return this.authService.deleteStudent({ id });
  }

  @Post('signin')
  @ApiAcceptedResponse({ description: 'Login successful' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiNotAcceptableResponse({ description: 'Wrong password' })
  signin(@Body() dto: SignInDTO) {
    return this.authService.signin(dto);
  }

  @Get('students')
  @UseGuards(AuthGuard, AdminGuard)
  students() {
    return this.authService.findStudents();
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async myInfo(@Request() req): Promise<User> {
    return this.authService.getMe(req.user.id);
  }

  @Get('student_clients')
  @UseGuards(AuthGuard)
  async studentClients(@Request() req) {
    return this.authService.studentClients(req.user.id);
  }

  @Get('profileIsCorrect')
  @UseGuards(AuthGuard)
  async profileIsCorrect(@Request() req) {
    return this.authService.profileIsCorrect(req.user.id);
  }


  @Post('saveProfile')
  @UseGuards(AuthGuard)
  async saveProfile(@Request() req, @Body() dto: UpdateProfileDTO): Promise<User> {
    const userId = req.user.id;
    return this.authService.saveProfile(userId, dto);
  }
}
