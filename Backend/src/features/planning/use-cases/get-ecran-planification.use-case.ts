import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { EcranPlanificationResponseDto } from '../dto/output/ecran-planification-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import { ajouterJours, aujourdHui } from '../../../shared/domain/jour-travail';

/**
 * Ouvre l'écran de planification d'un technicien (US-02 « Définir les blocs,
 * la zone, les jours et la période 2.0 », séquence étapes 2 à 5) : demain,
 * pour préremplir la date de début, et les zones proposées.
 */
@Injectable()
export class GetEcranPlanificationUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
    ): Promise<EcranPlanificationResponseDto> {
        // Un id inconnu, ou qui ne désigne pas un technicien : « introuvable »
        if (!(await this.repo.technicienExiste(technicienId))) {
            throw new NotFoundException('Technicien introuvable.');
        }

        return {
            // RG6 : la période commence au plus tôt demain, jour de Paris.
            // `aujourdHui()` lit l'horloge dans le fuseau d'exploitation ;
            // `ajouterJours` fait l'arithmétique de calendrier.
            demain: ajouterJours(aujourdHui(), 1),
            // RG4, RG5 : seules les zones affectées et actives
            zones: await this.repo.trouverZonesProposees(technicienId),
        };
    }
}
