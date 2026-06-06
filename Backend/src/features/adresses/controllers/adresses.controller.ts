import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetAdressesUseCase } from '../use-cases/get-adresses.use-case';
import { CreateAdresseUseCase } from '../use-cases/create-adresse.use-case';
import { UpdateAdresseUseCase } from '../use-cases/update-adresse.use-case';
import { DeleteAdresseUseCase } from '../use-cases/delete-adresse.use-case';
import { CreateAdresseDto, UpdateAdresseDto } from '../dto/input/adresse-input.dto';

@Controller('adresses')
@UseGuards(JwtAuthGuard)
export class AdressesController {
    constructor(
        private readonly getAdressesUseCase: GetAdressesUseCase,
        private readonly createAdresseUseCase: CreateAdresseUseCase,
        private readonly updateAdresseUseCase: UpdateAdresseUseCase,
        private readonly deleteAdresseUseCase: DeleteAdresseUseCase,
    ) {}

    @Get()
    findAll(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getAdressesUseCase.execute(userId);
    }

    @Post()
    create(@Req() req: Request, @Body() dto: CreateAdresseDto) {
        const { userId } = req.user as { userId: string };
        return this.createAdresseUseCase.execute(userId, dto);
    }

    @Patch(':id')
    update(@Req() req: Request, @Param('id') id: string, @Body() dto: UpdateAdresseDto) {
        const { userId } = req.user as { userId: string };
        return this.updateAdresseUseCase.execute(id, userId, dto);
    }

    @Delete(':id')
    remove(@Req() req: Request, @Param('id') id: string) {
        const { userId } = req.user as { userId: string };
        return this.deleteAdresseUseCase.execute(id, userId);
    }
}
