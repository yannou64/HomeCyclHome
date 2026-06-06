import { Body, Controller, Post } from '@nestjs/common';
import { CheckZoneDto, CheckZoneResultDto } from '../dto/check-zone.dto';
import { CheckZoneUseCase } from '../use-cases/check-zone.use-case';

@Controller('zones')
export class ZonesController {
    constructor(private readonly checkZoneUseCase: CheckZoneUseCase) {}

    @Post('check')
    check(@Body() dto: CheckZoneDto): Promise<CheckZoneResultDto> {
        return this.checkZoneUseCase.execute(dto.latitude, dto.longitude);
    }
}
