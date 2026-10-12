import { BadRequestException } from '@nestjs/common';
import { estCreneauReservable } from '../domain/creneau-reservable';
import { jourTravail } from '../domain/jour-travail';
import {
    CreneauAvecTechnicienDto,
    CreneauDisponibleDto,
} from '../dto/planning.dto';
import { IPlanningRepository } from '../repositories/planning.repository.interface';

export type GetCreneauxDisponiblesInput = {
    zoneId: string;
    dureeMinutes: number;
    dateDebut: string; // ISO date — borne inclusive
    dateFin: string; // ISO date — borne inclusive
};

export class GetCreneauxDisponiblesUseCase {
    constructor(private readonly repo: IPlanningRepository) {}

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

        // 1. Partition — la règle de buffer raisonne sur les voisins immédiats d'un
        //    créneau. Ces voisins n'ont de sens que pour un même technicien sur une
        //    même journée : une zone couverte par deux techniciens produit sinon des
        //    slots entrelacés et des voisinages faux.
        const groupes = this.grouperParTechnicienEtJour(creneaux);

        // 2. Application de la règle métier, indépendamment sur chaque groupe
        const proposables: CreneauDisponibleDto[] = [];
        for (const groupe of groupes.values()) {
            for (let i = 0; i < groupe.length; i++) {
                if (!estCreneauReservable(groupe, i, input.dureeMinutes)) {
                    continue;
                }
                proposables.push(this.toDto(groupe[i], input.dureeMinutes));
            }
        }

        // 3. Fusion — un seul créneau par horaire. Quand plusieurs techniciens sont
        //    libres en même temps, le premier dans l'ordre déterministe l'emporte.
        return this.dedoublonnerParHoraire(proposables);
    }

    // ── Helpers privés ────────────────────────────────────────────────────────

    // Clé de groupe : technicien + journée de travail. Les deux dimensions comptent —
    // un voisin d'index n'est un voisin réel que s'il appartient au même technicien
    // et à la même journée.
    private grouperParTechnicienEtJour(
        creneaux: CreneauAvecTechnicienDto[],
    ): Map<string, CreneauAvecTechnicienDto[]> {
        const groupes = new Map<string, CreneauAvecTechnicienDto[]>();

        for (const creneau of creneaux) {
            const cle = `${creneau.technicienId ?? 'manuel'}|${jourTravail(creneau.dateDebut)}`;

            const groupe = groupes.get(cle);
            if (groupe) {
                groupe.push(creneau);
            } else {
                groupes.set(cle, [creneau]);
            }
        }

        return groupes;
    }

    // Le tri garantit que « le premier technicien » est stable d'un appel à l'autre.
    private dedoublonnerParHoraire(
        proposables: CreneauDisponibleDto[],
    ): CreneauDisponibleDto[] {
        const parHoraire = new Map<string, CreneauDisponibleDto>();

        const tries = [...proposables].sort((a, b) => {
            if (a.dateDebut !== b.dateDebut) {
                return a.dateDebut < b.dateDebut ? -1 : 1;
            }
            return (a.technicienId ?? '').localeCompare(b.technicienId ?? '');
        });

        for (const creneau of tries) {
            if (!parHoraire.has(creneau.dateDebut)) {
                parHoraire.set(creneau.dateDebut, creneau);
            }
        }

        return [...parHoraire.values()];
    }

    private toDto(
        creneau: CreneauAvecTechnicienDto,
        dureeMinutes: number,
    ): CreneauDisponibleDto {
        const dateFin = new Date(
            new Date(creneau.dateDebut).getTime() + dureeMinutes * 60 * 1000,
        );

        return {
            id: creneau.id,
            dateDebut: creneau.dateDebut,
            dateFin: dateFin.toISOString(),
            technicienId: creneau.technicienId,
            technicienPrenom: creneau.technicienPrenom,
            // Toujours fini : estCreneauReservable écarte les créneaux détachés de
            // leur modèle, qui sont les seuls à porter Infinity.
            intervalleMinutes: creneau.intervalleMinutes,
            zoneId: creneau.zoneId,
        };
    }
}
