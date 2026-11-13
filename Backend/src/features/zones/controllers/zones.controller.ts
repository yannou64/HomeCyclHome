import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CheckZoneDto } from '../dto/input/check-zone.dto';
import { CheckZoneResponseDto } from '../dto/output/check-zone-response.dto';
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
    check(@Body() dto: CheckZoneDto): Promise<CheckZoneResponseDto> {
        return this.checkZoneUseCase.execute(dto.latitude, dto.longitude);
    }
}
