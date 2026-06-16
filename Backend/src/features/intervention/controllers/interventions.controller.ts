import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateInterventionUseCase } from '../use-cases/create-intervention.use-case';
import { GetClientInterventionsUseCase } from '../use-cases/get-client-interventions.use-case';
import { CancelInterventionUseCase } from '../use-cases/cancel-intervention.use-case';
import { CreateInterventionDto } from '../dto/input/create-intervention.dto';

@Controller('interventions')
@UseGuards(JwtAuthGuard)
export class InterventionsController {
    constructor(
        private readonly createInterventionUseCase: CreateInterventionUseCase,
        private readonly getClientInterventionsUseCase: GetClientInterventionsUseCase,
        private readonly cancelInterventionUseCase: CancelInterventionUseCase,
    ) {}

    @Post()
    create(@Req() req: Request, @Body() dto: CreateInterventionDto) {
        const { userId } = req.user as { userId: string };
        return this.createInterventionUseCase.execute(userId, dto);
    }

    @Get()
    getMyInterventions(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getClientInterventionsUseCase.execute(userId);
    }

    @Patch(':id/annuler')
    @HttpCode(HttpStatus.NO_CONTENT)
    cancelIntervention(@Req() req: Request, @Param('id') id: string) {
        const { userId } = req.user as { userId: string };
        return this.cancelInterventionUseCase.execute(id, userId);
    }
}
