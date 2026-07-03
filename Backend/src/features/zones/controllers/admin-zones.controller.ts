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
import { CreateZoneDto } from '../dto/create-zone.dto';
import { UpdateZoneDto } from '../dto/update-zone.dto';
import { CreateZoneUseCase } from '../use-cases/create-zone.use-case';
import { DeleteZoneUseCase } from '../use-cases/delete-zone.use-case';
import { GetZoneByIdUseCase } from '../use-cases/get-zone-by-id.use-case';
import { GetZonesUseCase } from '../use-cases/get-zones.use-case';
import { UpdateZoneUseCase } from '../use-cases/update-zone.use-case';

@ApiTags('Administration — Zones')
@ApiCookieAuth('access_token')
@Controller('admin/zones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminZonesController {
    constructor(
        private readonly getZonesUseCase: GetZonesUseCase,
        private readonly getZoneByIdUseCase: GetZoneByIdUseCase,
        private readonly createZoneUseCase: CreateZoneUseCase,
        private readonly updateZoneUseCase: UpdateZoneUseCase,
        private readonly deleteZoneUseCase: DeleteZoneUseCase,
    ) {}

    @ApiOkResponse({ description: 'Liste des zones' })
    @Get()
    findAll() {
        return this.getZonesUseCase.execute();
    }

    @ApiOkResponse({ description: "Détail d'une zone" })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.getZoneByIdUseCase.execute(id);
    }

    @ApiCreatedResponse({ description: 'Zone créée' })
    @Post()
    create(@Body() dto: CreateZoneDto) {
        return this.createZoneUseCase.execute(dto);
    }

    @ApiOkResponse({ description: 'Zone mise à jour' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateZoneDto) {
        return this.updateZoneUseCase.execute(id, dto);
    }

    @ApiNoContentResponse({ description: 'Zone supprimée' })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.deleteZoneUseCase.execute(id);
    }
}
