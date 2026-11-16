import { Injectable, Inject } from '@nestjs/common';
import { MarqueResponseDto } from '../dto/output/marque-response.dto';
import {
    MARQUES_REPO,
    type IMarquesRepository,
} from '../repositories/marques.repository.interface';

@Injectable()
export class GetMarquesUseCase {
    constructor(
        @Inject(MARQUES_REPO) private readonly repo: IMarquesRepository,
    ) {}

    execute(): Promise<MarqueResponseDto[]> {
        return this.repo.findAll();
    }
}
