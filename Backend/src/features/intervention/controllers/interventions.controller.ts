import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateInterventionUseCase } from '../use-cases/create-intervention.use-case';
import { CreateInterventionDto } from '../dto/input/create-intervention.dto';

@Controller('interventions')
@UseGuards(JwtAuthGuard)
export class InterventionsController {
    constructor(
        private readonly createInterventionUseCase: CreateInterventionUseCase,
    ) {}

    @Post()
    create(@Req() req: Request, @Body() dto: CreateInterventionDto) {
        const { userId } = req.user as { userId: string };
        return this.createInterventionUseCase.execute(userId, dto);
    }
}
