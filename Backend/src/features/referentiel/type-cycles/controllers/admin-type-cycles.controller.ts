import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { CreateTypeCycleDto } from '../dto/create-type-cycle.dto';
import { UpdateTypeCycleDto } from '../dto/update-type-cycle.dto';
import { CreateTypeCycleUseCase } from '../use-cases/create-type-cycle.use-case';
import { DeleteTypeCycleUseCase } from '../use-cases/delete-type-cycle.use-case';
import { GetTypeCyclesUseCase } from '../use-cases/get-type-cycles.use-case';
import { UpdateTypeCycleUseCase } from '../use-cases/update-type-cycle.use-case';

@Controller('admin/type-cycles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminTypeCyclesController {
    constructor(
        private readonly getTypeCyclesUseCase: GetTypeCyclesUseCase,
        private readonly createTypeCycleUseCase: CreateTypeCycleUseCase,
        private readonly updateTypeCycleUseCase: UpdateTypeCycleUseCase,
        private readonly deleteTypeCycleUseCase: DeleteTypeCycleUseCase,
    ) {}

    @Get()
    findAll() {
        return this.getTypeCyclesUseCase.execute();
    }

    @Post()
    create(@Body() dto: CreateTypeCycleDto) {
        return this.createTypeCycleUseCase.execute(dto.libelle);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTypeCycleDto) {
        return this.updateTypeCycleUseCase.execute(id, dto.libelle);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.deleteTypeCycleUseCase.execute(id);
    }
}
