import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Req,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBody,
    ApiConsumes,
    ApiCookieAuth,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateInterventionUseCase } from '../use-cases/create-intervention.use-case';
import { GetClientInterventionsUseCase } from '../use-cases/get-client-interventions.use-case';
import { CancelInterventionUseCase } from '../use-cases/cancel-intervention.use-case';
import { UploadInterventionPhotosUseCase } from '../use-cases/upload-intervention-photos.use-case';
import { CreateInterventionDto } from '../dto/input/create-intervention.dto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 Mo

@ApiTags('Interventions')
@ApiCookieAuth('access_token')
@Controller('interventions')
@UseGuards(JwtAuthGuard)
export class InterventionsController {
    constructor(
        private readonly createInterventionUseCase: CreateInterventionUseCase,
        private readonly getClientInterventionsUseCase: GetClientInterventionsUseCase,
        private readonly cancelInterventionUseCase: CancelInterventionUseCase,
        private readonly uploadInterventionPhotosUseCase: UploadInterventionPhotosUseCase,
    ) {}

    @ApiOperation({
        summary:
            'Crée une intervention et marque le créneau indisponible dans une transaction atomique',
    })
    @ApiCreatedResponse({
        description: 'Intervention créée, créneau marqué indisponible',
    })
    @Post()
    create(@Req() req: Request, @Body() dto: CreateInterventionDto) {
        const { userId } = req.user as { userId: string };
        return this.createInterventionUseCase.execute(userId, dto);
    }

    @ApiOkResponse({ description: 'Liste des interventions du client' })
    @Get()
    getMyInterventions(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getClientInterventionsUseCase.execute(userId);
    }

    @ApiNoContentResponse({ description: 'Intervention annulée' })
    @Patch(':id/annuler')
    @HttpCode(HttpStatus.NO_CONTENT)
    cancelIntervention(@Req() req: Request, @Param('id') id: string) {
        const { userId } = req.user as { userId: string };
        return this.cancelInterventionUseCase.execute(id, userId);
    }

    @ApiOperation({
        summary:
            "Upload jusqu'à 5 photos (JPEG/PNG/WebP, 30 Mo max) vers AWS S3",
    })
    @ApiCreatedResponse({ description: 'Photos uploadées vers S3' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                photos: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                },
            },
        },
    })
    @Post(':id/photos')
    @UseInterceptors(
        FilesInterceptor('photos', 5, {
            limits: { fileSize: MAX_FILE_SIZE_BYTES },
            fileFilter: (_req, file, cb) => {
                if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                    cb(null, true);
                } else {
                    cb(
                        new BadRequestException(
                            `Type de fichier non autorisé : ${file.mimetype}. Formats acceptés : JPEG, PNG, WebP.`,
                        ),
                        false,
                    );
                }
            },
        }),
    )
    uploadPhotos(
        @Req() req: Request,
        @Param('id') interventionId: string,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        const { userId } = req.user as { userId: string };
        return this.uploadInterventionPhotosUseCase.execute(
            interventionId,
            userId,
            files ?? [],
        );
    }
}
