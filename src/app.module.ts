import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { TasksModule } from './tasks/tasks.module';
import { FormListService } from './form-list/form-list.service';
import { FormListController } from './form-list/form-list.controller';
import { FormListModule } from './form-list/form-list.module';
import { ClientService } from './client/client.service';
import { ClientController } from './client/client.controller';
import { ClientModule } from './client/client.module';
import { PaymentController } from './payment/payment.controller';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    TasksModule,
    FormListModule,
    ClientModule,
    PaymentModule,
  ],
  providers: [FormListService, ClientService],
  controllers: [FormListController, ClientController, PaymentController],
})
export class AppModule {}
