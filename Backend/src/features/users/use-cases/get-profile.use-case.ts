import { NotFoundException } from '@nestjs/common';
import { UserProfileDto } from '../dto/user-profile.dto';
import { IUsersRepository } from '../repositories/users.repository.interface';

export class GetProfileUseCase {
    constructor(private readonly repo: IUsersRepository) {}

    async execute(userId: string): Promise<UserProfileDto> {
        const user = await this.repo.findById(userId);

        if (!user) {
            throw new NotFoundException('Utilisateur introuvable.');
        }

        return user;
    }
}
