import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import { UserProfileResponseDto } from '../dto/output/user-profile-response.dto';
import {
    USERS_REPO,
    type IUsersRepository,
    type UpdateUserData,
} from '../repositories/users.repository.interface';

@Injectable()
export class UpdateProfileUseCase {
    constructor(@Inject(USERS_REPO) private readonly repo: IUsersRepository) {}

    async execute(
        userId: string,
        data: UpdateUserData,
    ): Promise<UserProfileResponseDto> {
        // Vérification d'existence avant modification — pattern identique à admin
        const existing = await this.repo.findById(userId);

        if (!existing) {
            throw new NotFoundException('Utilisateur introuvable.');
        }

        return this.repo.update(userId, data);
    }
}
