import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateBrandUseCase } from '../../application/usecases/create-brand.usecase';
import { FindBrandUseCase } from '../../application/usecases/find-brand.usecase';
import { UpdateBrandUseCase } from '../../application/usecases/update-brand.usecase';
import { DeleteBrandUseCase } from '../../application/usecases/delete-brand.usecase';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { CurrentUser } from '../../../../shared/common/decorators/current-user.decorator';
import { JwtPayload } from '../../../auth/infra/strategies/jwt.strategy';

@Controller('brands')
export class BrandsController {
  constructor(
    private readonly createBrandUseCase: CreateBrandUseCase,
    private readonly findBrandUseCase: FindBrandUseCase,
    private readonly updateBrandUseCase: UpdateBrandUseCase,
    private readonly deleteBrandUseCase: DeleteBrandUseCase,
  ) {}

  @Post()
  async create(@Body() dto: CreateBrandDto, @CurrentUser() user: JwtPayload) {
    return this.createBrandUseCase.execute(dto, user.nickname);
  }

  @Get()
  async findAll() {
    return this.findBrandUseCase.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.findBrandUseCase.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBrandDto) {
    return this.updateBrandUseCase.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteBrandUseCase.execute(id);
  }
}
