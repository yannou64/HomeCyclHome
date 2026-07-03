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
    Req,
    UseGuards,
} from '@nestjs/common';
import {
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetAdressesUseCase } from '../use-cases/get-adresses.use-case';
import { CreateAdresseUseCase } from '../use-cases/create-adresse.use-case';
import { UpdateAdresseUseCase } from '../use-cases/update-adresse.use-case';
import { DeleteAdresseUseCase } from '../use-cases/delete-adresse.use-case';
import {
    CreateAdresseDto,
    UpdateAdresseDto,
} from '../dto/input/adresse-input.dto';

@ApiTags('Adresses')
@ApiCookieAuth('access_token')
@Controller('adresses')
@UseGuards(JwtAuthGuard)
export class AdressesController {
    constructor(
        private readonly getAdressesUseCase: GetAdressesUseCase,
        private readonly createAdresseUseCase: CreateAdresseUseCase,
        private readonly updateAdresseUseCase: UpdateAdresseUseCase,
        private readonly deleteAdresseUseCase: DeleteAdresseUseCase,
    ) {}

    @ApiOkResponse({ description: 'Liste des adresses du client' })
    @Get()
    findAll(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getAdressesUseCase.execute(userId);
    }

    @ApiCreatedResponse({ description: 'Adresse créée' })
    @Post()
    create(@Req() req: Request, @Body() dto: CreateAdresseDto) {
        const { userId } = req.user as { userId: string };
        return this.createAdresseUseCase.execute(userId, dto);
    }

    @ApiOkResponse({ description: 'Adresse mise à jour' })
    @Patch(':id')
    update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() dto: UpdateAdresseDto,
    ) {
        const { userId } = req.user as { userId: string };
        return this.updateAdresseUseCase.execute(id, userId, dto);
    }

    @ApiNoContentResponse({ description: 'Adresse supprimée' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Req() req: Request, @Param('id') id: string) {
        const { userId } = req.user as { userId: string };
        return this.deleteAdresseUseCase.execute(id, userId);
    }
}
