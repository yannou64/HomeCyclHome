import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../../shared/guards/roles.guard';
import { CreateMarqueDto } from '../dto/create-marque.dto';
import { UpdateMarqueDto } from '../dto/update-marque.dto';
import { CreateMarqueUseCase } from '../use-cases/create-marque.use-case';
import { DeleteMarqueUseCase } from '../use-cases/delete-marque.use-case';
import { GetMarquesUseCase } from '../use-cases/get-marques.use-case';
import { UpdateMarqueUseCase } from '../use-cases/update-marque.use-case';

@ApiTags('Référentiel — Marques')
@ApiCookieAuth('access_token')
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

    @ApiOkResponse({ description: 'Liste des marques' })
    @Get()
    findAll() {
        return this.getMarquesUseCase.execute();
    }

    @ApiCreatedResponse({ description: 'Marque créée' })
    @Post()
    create(@Body() dto: CreateMarqueDto) {
        return this.createMarqueUseCase.execute(dto.libelle);
    }

    @ApiOkResponse({ description: 'Marque mise à jour' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateMarqueDto) {
        return this.updateMarqueUseCase.execute(id, dto.libelle);
    }

    @ApiNoContentResponse({ description: 'Marque supprimée' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.deleteMarqueUseCase.execute(id);
    }
}
