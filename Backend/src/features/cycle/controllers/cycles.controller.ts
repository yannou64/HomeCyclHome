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
import type { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateCycleDto, UpdateCycleDto } from '../dto/input/cycle-input.dto';
import { CreateCycleUseCase } from '../use-cases/create-cycle.use-case';
import { DeleteCycleUseCase } from '../use-cases/delete-cycle.use-case';
import { GetCyclesUseCase } from '../use-cases/get-cycles.use-case';
import { UpdateCycleUseCase } from '../use-cases/update-cycle.use-case';

@ApiTags('Cycles')
@ApiCookieAuth('access_token')
@Controller('cycles')
@UseGuards(JwtAuthGuard)
export class CyclesController {
    constructor(
        private readonly getCyclesUseCase: GetCyclesUseCase,
        private readonly createCycleUseCase: CreateCycleUseCase,
        private readonly updateCycleUseCase: UpdateCycleUseCase,
        private readonly deleteCycleUseCase: DeleteCycleUseCase,
    ) {}

    @ApiOkResponse({ description: 'Liste des cycles du client' })
    @Get()
    findAll(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getCyclesUseCase.execute(userId);
    }

    @ApiCreatedResponse({ description: 'Cycle créé' })
    @Post()
    create(@Req() req: Request, @Body() dto: CreateCycleDto) {
        const { userId } = req.user as { userId: string };
        return this.createCycleUseCase.execute(userId, dto);
    }

    @ApiOkResponse({ description: 'Cycle mis à jour' })
    @Patch(':id')
    update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() dto: UpdateCycleDto,
    ) {
        const { userId } = req.user as { userId: string };
        return this.updateCycleUseCase.execute(id, userId, dto);
    }

    @ApiNoContentResponse({ description: 'Cycle supprimé' })
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    remove(@Req() req: Request, @Param('id') id: string) {
        const { userId } = req.user as { userId: string };
        return this.deleteCycleUseCase.execute(id, userId);
    }
}
