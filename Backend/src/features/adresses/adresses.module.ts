import { Module } from '@nestjs/common';
import { AdressesController } from './controllers/adresses.controller';
import { AdressesPrismaRepository } from './repositories/adresses.prisma.repository';
import { GetAdressesUseCase } from './use-cases/get-adresses.use-case';
import { CreateAdresseUseCase } from './use-cases/create-adresse.use-case';
import { UpdateAdresseUseCase } from './use-cases/update-adresse.use-case';
import { DeleteAdresseUseCase } from './use-cases/delete-adresse.use-case';

export const ADRESSES_REPO = 'ADRESSES_REPO';

@Module({
    controllers: [AdressesController],
    providers: [
        { provide: ADRESSES_REPO, useClass: AdressesPrismaRepository },
        {
            provide: GetAdressesUseCase,
            useFactory: (repo: AdressesPrismaRepository) =>
                new GetAdressesUseCase(repo),
            inject: [ADRESSES_REPO],
        },
        {
            provide: CreateAdresseUseCase,
            useFactory: (repo: AdressesPrismaRepository) =>
                new CreateAdresseUseCase(repo),
            inject: [ADRESSES_REPO],
        },
        {
            provide: UpdateAdresseUseCase,
            useFactory: (repo: AdressesPrismaRepository) =>
                new UpdateAdresseUseCase(repo),
            inject: [ADRESSES_REPO],
        },
        {
            provide: DeleteAdresseUseCase,
            useFactory: (repo: AdressesPrismaRepository) =>
                new DeleteAdresseUseCase(repo),
            inject: [ADRESSES_REPO],
        },
    ],
})
export class AdressesModule {}
