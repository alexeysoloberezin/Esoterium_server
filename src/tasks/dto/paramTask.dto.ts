import { IsString, IsUUID } from 'class-validator';

export class TaskParamDTO {
  @IsString()
  @IsUUID()
  task_id: string;
}
