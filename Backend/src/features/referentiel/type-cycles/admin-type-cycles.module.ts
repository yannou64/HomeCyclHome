import { Module } from '@nestjs/common';
import { AdminTypeCyclesController } from './controllers/admin-type-cycles.controller';
import { ReferentielTypeCyclesController } from './controllers/referentiel-type-cycles.controller';
import { TypeCyclesPrismaRepository } from './repositories/type-cycles.prisma.repository';
import { CreateTypeCycleUseCase } from './use-cases/create-type-cycle.use-case';
import { DeleteTypeCycleUseCase } from './use-cases/delete-type-cycle.use-case';
import { GetTypeCyclesUseCase } from './use-cases/get-type-cycles.use-case';
import { TYPE_CYCLES_REPO } from './repositories/type-cycles.repository.interface';
import { UpdateTypeCycleUseCase } from './use-cases/update-type-cycle.use-case';

@Module({
    controllers: [AdminTypeCyclesController, ReferentielTypeCyclesController],
    providers: [
        { provide: TYPE_CYCLES_REPO, useClass: TypeCyclesPrismaRepository },
        GetTypeCyclesUseCase,
        CreateTypeCycleUseCase,
        UpdateTypeCycleUseCase,
        DeleteTypeCycleUseCase,
    ],
})
export class TypeCyclesModule {}
