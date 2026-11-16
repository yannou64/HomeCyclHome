import { Injectable, Inject } from '@nestjs/common';
import {
    AUTH_REPO,
    type IAuthRepository,
} from '../repositories/auth.repository.interface';

@Injectable()
export class LogoutUseCase {
    constructor(@Inject(AUTH_REPO) private readonly repo: IAuthRepository) {}

    async execute(userId: string): Promise<void> {
        // Invalide le refresh token en base — les cookies sont vidés par le controller
        await this.repo.clearRefreshTokenHash(userId);
    }
}
