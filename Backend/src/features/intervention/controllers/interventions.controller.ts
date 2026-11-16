import {
    BadRequestException,
    Controller,
    Get,
    Param,
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
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { GetClientInterventionsUseCase } from '../use-cases/get-client-interventions.use-case';
import { UploadInterventionPhotosUseCase } from '../use-cases/upload-intervention-photos.use-case';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024; // 30 Mo

@ApiTags('Interventions')
@ApiCookieAuth('access_token')
@Controller('interventions')
@UseGuards(JwtAuthGuard)
export class InterventionsController {
    constructor(
        private readonly getClientInterventionsUseCase: GetClientInterventionsUseCase,
        private readonly uploadInterventionPhotosUseCase: UploadInterventionPhotosUseCase,
    ) {}

    @ApiOkResponse({ description: 'Liste des interventions du client' })
    @Get()
    getMyInterventions(@Req() req: Request) {
        const { userId } = req.user as { userId: string };
        return this.getClientInterventionsUseCase.execute(userId);
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
