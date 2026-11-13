import { NotFoundException } from '@nestjs/common';
import { UserProfileResponseDto } from '../dto/output/user-profile-response.dto';
import { IUsersRepository } from '../repositories/users.repository.interface';

export class GetProfileUseCase {
    constructor(private readonly repo: IUsersRepository) {}

    async execute(userId: string): Promise<UserProfileResponseDto> {
        const user = await this.repo.findById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable.');
        }

        return user;
    }
}
