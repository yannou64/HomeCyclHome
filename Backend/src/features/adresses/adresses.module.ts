import { Module } from '@nestjs/common';
import { AdressesController } from './controllers/adresses.controller';
import { AdressesPrismaRepository } from './repositories/adresses.prisma.repository';
import { GetAdressesUseCase } from './use-cases/get-adresses.use-case';
import { CreateAdresseUseCase } from './use-cases/create-adresse.use-case';
import { UpdateAdresseUseCase } from './use-cases/update-adresse.use-case';
import { ADRESSES_REPO } from './repositories/adresses.repository.interface';
import { DeleteAdresseUseCase } from './use-cases/delete-adresse.use-case';

@Module({
    controllers: [AdressesController],
    providers: [
        { provide: ADRESSES_REPO, useClass: AdressesPrismaRepository },
        GetAdressesUseCase,
        CreateAdresseUseCase,
        UpdateAdresseUseCase,
        DeleteAdresseUseCase,
    ],
})
export class AdressesModule {}
