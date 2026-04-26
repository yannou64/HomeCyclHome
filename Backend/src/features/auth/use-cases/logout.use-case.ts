import { IAuthRepository } from '../repositories/auth.repository.interface';

export class LogoutUseCase {
    constructor(private readonly repo: IAuthRepository) {}

    async execute(userId: string): Promise<void> {
        // Invalide le refresh token en base — les cookies sont vidés par le controller
        await this.repo.clearRefreshTokenHash(userId);
    }
}
