import { ConflictException } from '@nestjs/common';
import { TypeCycleDto } from '../dto/type-cycle.dto';
import { ITypeCyclesRepository } from '../repositories/type-cycles.repository.interface';

export class CreateTypeCycleUseCase {
  constructor(private readonly repo: ITypeCyclesRepository) {}

  async execute(libelle: string): Promise<TypeCycleDto> {
    const existing = await this.repo.findByLibelle(libelle);
    if (existing) {
      throw new ConflictException(`Le type de cycle "${libelle}" existe déjà`);
    }
    return this.repo.create(libelle);
  }
}
