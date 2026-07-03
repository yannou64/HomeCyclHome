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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { CreateForfaitDto } from '../dto/create-forfait.dto';
import { SetForfaitPrixDto } from '../dto/set-forfait-prix.dto';
import { UpdateForfaitDto } from '../dto/update-forfait.dto';
import { CreateForfaitUseCase } from '../use-cases/create-forfait.use-case';
import { DeleteForfaitUseCase } from '../use-cases/delete-forfait.use-case';
import { GetForfaitsUseCase } from '../use-cases/get-forfaits.use-case';
import { SetForfaitPrixUseCase } from '../use-cases/set-forfait-prix.use-case';
import { UpdateForfaitUseCase } from '../use-cases/update-forfait.use-case';

@ApiTags('Administration — Forfaits')
@ApiCookieAuth('access_token')
@Controller('admin/forfaits')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminForfaitsController {
    constructor(
        private readonly getForfaitsUseCase: GetForfaitsUseCase,
        private readonly createForfaitUseCase: CreateForfaitUseCase,
        private readonly updateForfaitUseCase: UpdateForfaitUseCase,
        private readonly deleteForfaitUseCase: DeleteForfaitUseCase,
        private readonly setForfaitPrixUseCase: SetForfaitPrixUseCase,
    ) {}

    @ApiOkResponse({ description: 'Liste des forfaits' })
    @Get()
    findAll() {
        return this.getForfaitsUseCase.execute();
    }

    @ApiCreatedResponse({ description: 'Forfait créé' })
    @Post()
    create(@Body() dto: CreateForfaitDto) {
        return this.createForfaitUseCase.execute(dto);
    }

    @ApiOkResponse({ description: 'Forfait mis à jour' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateForfaitDto) {
        return this.updateForfaitUseCase.execute(id, dto);
    }

    @ApiNoContentResponse({ description: 'Forfait supprimé' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.deleteForfaitUseCase.execute(id);
    }

    @ApiCreatedResponse({ description: 'Nouveau prix historisé' })
    @Post(':id/prix')
    setPrix(@Param('id') id: string, @Body() dto: SetForfaitPrixDto) {
        return this.setForfaitPrixUseCase.execute(
            id,
            dto.montant,
            new Date(dto.dateDebut),
        );
    }
}
