import { IsString, IsInt, Length, Min, Max } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @Length(7, 10)
  licensePlate!: string;

  @IsString()
  @Length(17, 17)
  chassis!: string;

  @IsString()
  @Length(11, 11)
  renavam!: string;

  @IsInt()
  @Min(1950)
  @Max(2100)
  year!: number;

  @IsString()
  modelId!: string;
}
