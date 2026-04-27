import { Module } from '@nestjs/common';
import { AdminTypeCyclesController } from '../controllers/admin-type-cycles.controller';
import { TypeCyclesPrismaRepository } from '../repositories/type-cycles.prisma.repository';
import { CreateTypeCycleUseCase } from '../use-cases/create-type-cycle.use-case';
import { DeleteTypeCycleUseCase } from '../use-cases/delete-type-cycle.use-case';
import { GetTypeCyclesUseCase } from '../use-cases/get-type-cycles.use-case';
import { UpdateTypeCycleUseCase } from '../use-cases/update-type-cycle.use-case';

export const TYPE_CYCLES_REPO = 'TYPE_CYCLES_REPO';

@Module({
  controllers: [AdminTypeCyclesController],
  providers: [
    { provide: TYPE_CYCLES_REPO, useClass: TypeCyclesPrismaRepository },
    {
      provide: GetTypeCyclesUseCase,
      useFactory: (repo: TypeCyclesPrismaRepository) => new GetTypeCyclesUseCase(repo),
      inject: [TYPE_CYCLES_REPO],
    },
    {
      provide: CreateTypeCycleUseCase,
      useFactory: (repo: TypeCyclesPrismaRepository) => new CreateTypeCycleUseCase(repo),
      inject: [TYPE_CYCLES_REPO],
    },
    {
      provide: UpdateTypeCycleUseCase,
      useFactory: (repo: TypeCyclesPrismaRepository) => new UpdateTypeCycleUseCase(repo),
      inject: [TYPE_CYCLES_REPO],
    },
    {
      provide: DeleteTypeCycleUseCase,
      useFactory: (repo: TypeCyclesPrismaRepository) => new DeleteTypeCycleUseCase(repo),
      inject: [TYPE_CYCLES_REPO],
    },
  ],
})
export class TypeCyclesModule {}
