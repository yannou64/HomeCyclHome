import { BadRequestException, Inject } from '@nestjs/common';
import { CreneauDisponibleDto } from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export type GetCreneauxDisponiblesInput = {
    zoneId: string;
    dureeMinutes: number;
    dateDebut: string; // ISO date — borne inclusive
    dateFin: string; // ISO date — borne inclusive
};

export class GetCreneauxDisponiblesUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(
        input: GetCreneauxDisponiblesInput,
    ): Promise<CreneauDisponibleDto[]> {
        if (!input.zoneId) {
            throw new BadRequestException('Le zoneId est requis.');
        }
        if (input.dureeMinutes <= 0) {
            throw new BadRequestException(
                'La durée doit être supérieure à zéro.',
            );
        }

        const debut = new Date(input.dateDebut);
        debut.setUTCHours(0, 0, 0, 0);

        const fin = new Date(input.dateFin);
        fin.setUTCHours(23, 59, 59, 999);

        const creneaux = await this.repo.findCreneauxByZone(
            input.zoneId,
            debut,
            fin,
        );

        const results: CreneauDisponibleDto[] = [];
        const dureeMs = input.dureeMinutes * 60 * 1000;

        for (let i = 0; i < creneaux.length; i++) {
            const creneau = creneaux[i];

            if (!creneau.is_disponible) continue;

            // Buffer avant : le slot précédent doit exister, être disponible ET adjacent
            // Un gap > intervalleMinutes = trou causé par une pause → pas de buffer de déplacement
            if (i === 0) continue;
            const prevCreneau = creneaux[i - 1];
            if (!prevCreneau.is_disponible) continue;
            const ecartMs =
                new Date(creneau.date_debut).getTime() -
                new Date(prevCreneau.date_debut).getTime();
            if (ecartMs > creneau.intervalleMinutes * 60 * 1000) continue;

            const dateDebutIntervention = new Date(creneau.date_debut);
            const dateFinIntervention = new Date(
                dateDebutIntervention.getTime() + dureeMs,
            );

            // Vérifier que tous les slots couverts par la durée du forfait sont disponibles
            // Un slot j est couvert si son date_debut est dans [dateDebut, dateFinIntervention)
            let dernierSlotIdx = i;
            let slotIntermediaireReserve = false;

            for (let j = i; j < creneaux.length; j++) {
                const slotDebut = new Date(creneaux[j].date_debut);
                if (slotDebut >= dateFinIntervention) break;
                if (!creneaux[j].is_disponible) {
                    slotIntermediaireReserve = true;
                    break;
                }
                dernierSlotIdx = j;
            }

            if (slotIntermediaireReserve) continue;

            // Buffer après : le slot qui suit la fin de l'intervention doit être disponible
            const bufferApresIdx = dernierSlotIdx + 1;
            if (
                bufferApresIdx >= creneaux.length ||
                !creneaux[bufferApresIdx].is_disponible
            ) {
                continue;
            }

            results.push({
                id: creneau.id,
                date_debut: creneau.date_debut,
                date_fin: dateFinIntervention.toISOString(),
                technicien_id: creneau.technicien_id,
                zone_id: creneau.zone_id,
            });
        }

        return results;
    }
}
