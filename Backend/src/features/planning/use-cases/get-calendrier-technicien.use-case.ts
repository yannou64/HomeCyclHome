import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CalendrierTechnicienResponseDto } from '../dto/output/calendrier-technicien-response.dto';
import {
    PLANNING_REPO,
    type IPlanningRepository,
} from '../repositories/planning.repository.interface';
import { aujourdHui } from '../../../shared/domain/jour-travail';
import { bornesDuMois, joursCouverts } from './get-couverture-mois.use-case';

/**
 * Calendrier d'un technicien pour un mois (US-01 « Consulter le calendrier et
 * la journée d'un technicien 2.0 », séquence étapes 2 à 6 et 15 à 17).
 *
 * C'est le calendrier de couverture réduit à un technicien : mêmes bornes de
 * mois, même regroupement par jour de Paris. Un technicien ne couvrant qu'une
 * zone par jour, chaque jour planifié a un seul point (RG2). N'importe quel
 * mois, passé compris (RG6). Lecture seule.
 */
@Injectable()
export class GetCalendrierTechnicienUseCase {
    constructor(
        @Inject(PLANNING_REPO) private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        technicienId: string,
        mois?: string,
    ): Promise<CalendrierTechnicienResponseDto> {
        // Un id inconnu, ou qui ne désigne pas un technicien : « introuvable »
        const technicien = await this.repo.trouverTechnicien(technicienId);
        if (!technicien) {
            throw new NotFoundException('Technicien introuvable.');
        }

        // Sans mois demandé : celui du jour, à Paris
        const jourCourant = aujourdHui();
        const moisVise = mois ?? jourCourant.slice(0, 7);
        const { debut, fin } = bornesDuMois(moisVise);
        const creneaux = await this.repo.trouverCreneauxEntre(
            debut,
            fin,
            technicienId, // ses créneaux seulement
        );

        return {
            technicien: {
                id: technicien.id,
                prenom: technicien.prenom,
                nom: technicien.nom,
            },
            mois: moisVise,
            aujourdHui: jourCourant,
            jours: joursCouverts(creneaux),
        };
    }
}
