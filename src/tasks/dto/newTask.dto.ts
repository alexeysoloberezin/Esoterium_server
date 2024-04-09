import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Validate,
  ValidatorConstraint,
  ValidationArguments,
} from 'class-validator';
import * as moment from 'moment';

@ValidatorConstraint({ name: 'customDateTimeFormat', async: false })
export class DateValidator {
  validate(value: string) {
    const date = moment(value, 'YYYY-MM-DD HH:mm', true);
    return date.isValid();
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} must be a valid date in the format "YYYY-MM-DD HH:mm:"`;
  }
}

export class TaskDTO {
  @ApiProperty({ description: 'Title of the task', required: true })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Description of the task', required: true })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'dateTime of the task format: YYYY-MM-DD HH:mm',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @Validate(DateValidator)
  dateTime: string;
}
