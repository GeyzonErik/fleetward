import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateModelUseCase } from '../../application/usecases/create-model.usecase';
import { FindModelUseCase } from '../../application/usecases/find-model.usecase';
import { UpdateModelUseCase } from '../../application/usecases/update-model.usecase';
import { DeleteModelUseCase } from '../../application/usecases/delete-model.usecase';
import { CreateModelDto } from '../dto/create-model.dto';
import { UpdateModelDto } from '../dto/update-model.dto';
import { CurrentUser } from '../../../../shared/common/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/infra/strategies/jwt.strategy';

@Controller('models')
export class ModelsController {
  constructor(
    private readonly createModelUseCase: CreateModelUseCase,
    private readonly findModelUseCase: FindModelUseCase,
    private readonly updateModelUseCase: UpdateModelUseCase,
    private readonly deleteModelUseCase: DeleteModelUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateModelDto, @CurrentUser() user: JwtPayload) {
    return this.createModelUseCase.execute(dto, user.nickname);
  }

  @Get()
  async findAll() {
    return this.findModelUseCase.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.findModelUseCase.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return this.updateModelUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteModelUseCase.execute(id);
  }
}
