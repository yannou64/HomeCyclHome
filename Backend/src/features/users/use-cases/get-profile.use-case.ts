import { NotFoundException, Injectable, Inject } from '@nestjs/common';
import { UserProfileResponseDto } from '../dto/output/user-profile-response.dto';
import {
    USERS_REPO,
    type IUsersRepository,
} from '../repositories/users.repository.interface';

@Injectable()
export class GetProfileUseCase {
    constructor(@Inject(USERS_REPO) private readonly repo: IUsersRepository) {}

    async execute(userId: string): Promise<UserProfileResponseDto> {
        const user = await this.repo.findById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable.');
        }

        return user;
    }
}
