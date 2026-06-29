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

@Controller('interventions')
@UseGuards(JwtAuthGuard)
export class InterventionsController {
    constructor(
        private readonly createInterventionUseCase: CreateInterventionUseCase,
        private readonly getClientInterventionsUseCase: GetClientInterventionsUseCase,
        private readonly cancelInterventionUseCase: CancelInterventionUseCase,
        private readonly uploadInterventionPhotosUseCase: UploadInterventionPhotosUseCase,
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
