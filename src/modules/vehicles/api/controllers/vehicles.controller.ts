import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateVehicleUseCase } from '../../application/usecases/create-vehicle.usecase';
import { FindVehicleUseCase } from '../../application/usecases/find-vehicle.usecase';
import { UpdateVehicleUseCase } from '../../application/usecases/update-vehicle.usecase';
import { DeleteVehicleUseCase } from '../../application/usecases/delete-vehicle.usecase';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { CurrentUser } from '../../../../shared/common/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/infra/strategies/jwt.strategy';

@Controller('vehicles')
export class VehiclesController {
  constructor(
    private readonly createVehicleUseCase: CreateVehicleUseCase,
    private readonly findVehicleUseCase: FindVehicleUseCase,
    private readonly updateVehicleUseCase: UpdateVehicleUseCase,
    private readonly deleteVehicleUseCase: DeleteVehicleUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateVehicleDto, @CurrentUser() user: JwtPayload) {
    return this.createVehicleUseCase.execute(dto, user.nickname);
  }

  @Get()
  async findAll() {
    return this.findVehicleUseCase.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.findVehicleUseCase.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
    return this.updateVehicleUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.deleteVehicleUseCase.execute(id, user.nickname);
  }
}
