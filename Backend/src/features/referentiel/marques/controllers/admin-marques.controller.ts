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
import { CreateMarqueDto } from '../dto/create-marque.dto';
import { UpdateMarqueDto } from '../dto/update-marque.dto';
import { CreateMarqueUseCase } from '../use-cases/create-marque.use-case';
import { DeleteMarqueUseCase } from '../use-cases/delete-marque.use-case';
import { GetMarquesUseCase } from '../use-cases/get-marques.use-case';
import { UpdateMarqueUseCase } from '../use-cases/update-marque.use-case';

@Controller('admin/marques')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminMarquesController {
    constructor(
        private readonly getMarquesUseCase: GetMarquesUseCase,
        private readonly createMarqueUseCase: CreateMarqueUseCase,
        private readonly updateMarqueUseCase: UpdateMarqueUseCase,
        private readonly deleteMarqueUseCase: DeleteMarqueUseCase,
    ) {}

    @Get()
    findAll() {
        return this.getMarquesUseCase.execute();
    }

    @Post()
    create(@Body() dto: CreateMarqueDto) {
        return this.createMarqueUseCase.execute(dto.libelle);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateMarqueDto) {
        return this.updateMarqueUseCase.execute(id, dto.libelle);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.deleteMarqueUseCase.execute(id);
    }
}
