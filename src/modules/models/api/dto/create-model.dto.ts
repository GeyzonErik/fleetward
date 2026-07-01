import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateModelDto {
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name!: string;
}
