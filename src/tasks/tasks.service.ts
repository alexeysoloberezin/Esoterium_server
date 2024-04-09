import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TaskDTO } from './dto';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}
  async saveTask(data: TaskDTO, user: User) {
    try {
      const save = await this.prisma.task.create({
        data: { ...data, userId: user.id },
      });
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Your task has been created successfully',
        task_details: save,
      };
    } catch (error) {
      throw new Error('Task creation failed');
    }
  }

  async allTasks() {
    const tasks = await this.prisma.task.findMany();
    return {
      statusCode: HttpStatus.OK,
      message: 'All saved tasks in your account',
      tasks,
    };
  }

  async editTask(task_id: string, taskDetails: TaskDTO) {

  }

  async deleteTask(task_id: string) {

  }

  async singleTask(task_id: string) {
    // const response = await this.prisma.task.findFirst({
    //   where: { id: task_id, userId: user.id },
    // });
    // return { message: `Task with ${task_id}`, task: response };
  }

  async statusChange(task_id: string) {
    // try {
    //   const checkTask = await this.checkOwnership(task_id, user.id);
    //   const update = await this.prisma.task.update({
    //     where: { id: task_id },
    //     data: { isCompleted: !checkTask.isCompleted },
    //   });
    //   return {
    //     statusCode: HttpStatus.OK,
    //     message: `${update.title} is now marked as ${
    //       update.isCompleted ? 'completed ✅' : 'not completed ❌'
    //     }`,
    //   };
    // } catch (error) {
    //   return this.errorReturner(error);
    // }
  }

  private async checkOwnership(task_id: string, user_id: string) {
  }

  private errorReturner(error: any) {
    if (error instanceof HttpException) {
      throw new HttpException(
        {
          statusCode: error.getStatus(),
          message: error.message,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    throw new BadRequestException(error.message);
  }
}
