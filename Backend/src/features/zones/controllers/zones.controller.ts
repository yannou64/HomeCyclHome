import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckZoneDto, CheckZoneResultDto } from '../dto/check-zone.dto';
import { CheckZoneUseCase } from '../use-cases/check-zone.use-case';

@ApiTags('Zones')
@Controller('zones')
export class ZonesController {
    constructor(private readonly checkZoneUseCase: CheckZoneUseCase) {}

    @ApiOperation({
        summary:
            'Vérifie si des coordonnées GPS sont dans une zone couverte (algorithme Ray Casting)',
    })
    @ApiOkResponse({
        description: 'Zone couvrant les coordonnées, si elle existe',
    })
    @HttpCode(HttpStatus.OK)
    @Post('check')
    check(@Body() dto: CheckZoneDto): Promise<CheckZoneResultDto> {
        return this.checkZoneUseCase.execute(dto.latitude, dto.longitude);
    }
}
