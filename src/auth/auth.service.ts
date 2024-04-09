import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotAcceptableException,
  NotFoundException
} from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { SignUpDTO, SignInDTO } from "./dto";
import * as argon from "argon2";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { User } from "@prisma/client";
import { UpdateProfileDTO } from "./dto/update.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {
  }

  async studentClients(userId: string){
    const clients = this.prisma.client.findMany({
      where: {
        userId
      },
    });
    return clients
  }

  async profileIsCorrect(id: string){
    const user = await this.getMe(id)
    if(!user.telegram || !user.paymentNumber || !user.paymentType){
      return {
        isCorrect: false
      }
    }
    return {
      isCorrect: true
    }
  }

  async getMe(id: string) {
    try {
      const user =  await this.prisma.user.findFirst({
        where: { id }
      });

      if(!user){
        throw new HttpException(
          {
            statusCode: 400,
            message: "Ошибка"
          },
          HttpStatus.CREATED
        );
      }

      delete user.password
      return user
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Студент с ID ${id} не найден`);
      } else {
        throw error;
      }
    }
  }

  async deleteStudent({ id }) {
    try {
      await this.prisma.user.delete({
        where: { id }
      });
    } catch (error) {
      if (error.code === "P2025") {
        throw new NotFoundException(`Студент с ID ${id} не найден`);
      } else {
        throw error;
      }
    }
  }

  async createAdmin(dto: SignUpDTO) {
    if (dto.email !== "admin061@admin.com") {
      throw new HttpException(
        {
          statusCode: 400,
          message: "Ошибка"
        },
        HttpStatus.CREATED
      );
    }

    let data = {
      ...dto,
      role: "admin"
    };

    try {
      const user = await this.prisma.user.create({
        data,
        select: { email: true, role: true } as any
      });
      throw new HttpException(
        {
          statusCode: 201,
          message: "You have successfully created your account",
          data: user
        },
        HttpStatus.CREATED
      );
    } catch (error) {
      if (error.code === "P2002") {
        throw new ConflictException(
          "Почта уже занята"
        );
      } else {
        throw error;
      }
    }
  }

  async createStudent(dto: SignUpDTO) {
    let data = {
      ...dto,
      role: "student"
    };

    try {
      const user = await this.prisma.user.create({
        data,
        select: { email: true, role: true } as any
      });
      throw new HttpException(
        {
          statusCode: 201,
          message: "You have successfully created your account",
          data: user
        },
        HttpStatus.CREATED
      );
    } catch (error) {
      if (error.code === "P2002") {
        throw new ConflictException(
          "Почта уже занята"
        );
      } else {
        throw error;
      }
    }
  }

  async signin(dto: SignInDTO) {
    const userFound = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });
    if (!userFound) {
      throw new NotFoundException(
        `Пользователь не найден`
      );
    }
    const decrpyt: boolean = await argon.verify(
      userFound.password,
      dto.password
    );
    if (!decrpyt) throw new NotAcceptableException("Не правельный пароль");
    const token = this.signToken({
      id: userFound.id,
      email: userFound.email,
      role: userFound.role
    });
    throw new HttpException(
      {
        statusCode: HttpStatus.ACCEPTED,
        message: "Login successfully",
        data: {
          token,
          user: userFound.email,
          role: userFound.role
        }
      },
      HttpStatus.ACCEPTED
    );
  }

  signToken(payload: { id: string; email: string | null, role: string }) {
    const secret = this.config.get("JWT_SECRET");
    const token: string = this.jwt.sign(payload, { secret, expiresIn: "1w" });
    return token;
  }

  async findStudents(): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        role: "student"
      },
      include: {
        clients: true, // Загружаем связанных клиентов
      },
    });
  }

  async saveProfile(userId: string, dto: UpdateProfileDTO): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto
    });
  }
}
