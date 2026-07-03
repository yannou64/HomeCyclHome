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

            if (!creneau.isDisponible) continue;

            // Buffer avant : le slot précédent doit exister, être disponible ET adjacent
            // Un gap > intervalleMinutes = trou causé par une pause → pas de buffer de déplacement
            if (i === 0) continue;
            const prevCreneau = creneaux[i - 1];
            if (!prevCreneau.isDisponible) continue;
            const ecartMs =
                new Date(creneau.dateDebut).getTime() -
                new Date(prevCreneau.dateDebut).getTime();
            if (ecartMs > creneau.intervalleMinutes * 60 * 1000) continue;

            const dateDebutIntervention = new Date(creneau.dateDebut);
            const dateFinIntervention = new Date(
                dateDebutIntervention.getTime() + dureeMs,
            );

            // Vérifier que tous les slots couverts par la durée du forfait sont disponibles
            // Un slot j est couvert si son dateDebut est dans [dateDebut, dateFinIntervention)
            let dernierSlotIdx = i;
            let slotIntermediaireReserve = false;

            for (let j = i; j < creneaux.length; j++) {
                const slotDebut = new Date(creneaux[j].dateDebut);
                if (slotDebut >= dateFinIntervention) break;
                if (!creneaux[j].isDisponible) {
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
                !creneaux[bufferApresIdx].isDisponible
            ) {
                continue;
            }

            results.push({
                id: creneau.id,
                dateDebut: creneau.dateDebut,
                dateFin: dateFinIntervention.toISOString(),
                technicienId: creneau.technicienId,
                zoneId: creneau.zoneId,
            });
        }

        return results;
    }
}
