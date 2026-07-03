import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import {
    CreateCreneauData,
    GenerationRapportDto,
    IndisponibiliteDto,
    PauseRecurrenteDto,
} from '../dto/planning.dto';
import {
    IPlanningRepository,
    PLANNING_REPO,
} from '../repositories/planning.repository.interface';

export type GenerateCreneauxInput = {
    modeleId: string;
    // Borne EXCLUSIVE : les créneaux sont générés pour les jours strictement AVANT cette date.
    // Si absent : dateFinValidite du modèle (inclusive → convertie) ou début + MAX_MOIS.
    dateFinGeneration?: string;
};

const MAX_MOIS = 6;

export class GenerateCreneauxUseCase {
    constructor(
        @Inject(PLANNING_REPO)
        private readonly repo: IPlanningRepository,
    ) {}

    async execute(input: GenerateCreneauxInput): Promise<GenerationRapportDto> {
        // 1. Charger le modèle
        const modele = await this.repo.findModeleById(input.modeleId);
        if (!modele) {
            throw new NotFoundException(
                `Modèle de planification introuvable : ${input.modeleId}`,
            );
        }

        // 2. Déterminer la plage de génération
        const debut = new Date(modele.dateDebutValidite);
        debut.setUTCHours(0, 0, 0, 0);

        // Limite maximale (exclusive) : 6 mois après le début de validité
        const limiteMax = new Date(debut);
        limiteMax.setUTCMonth(limiteMax.getUTCMonth() + MAX_MOIS);
        limiteMax.setUTCHours(0, 0, 0, 0);

        let fin: Date;
        if (input.dateFinGeneration) {
            // dateFinGeneration est une borne exclusive : on génère les jours AVANT cette date
            fin = new Date(input.dateFinGeneration);
            fin.setUTCHours(0, 0, 0, 0);
        } else if (modele.dateFinValidite) {
            // dateFinValidite est inclusive → on ajoute 1 jour pour en faire une borne exclusive
            fin = new Date(modele.dateFinValidite);
            fin.setUTCHours(0, 0, 0, 0);
            fin.setUTCDate(fin.getUTCDate() + 1);
        } else {
            // Aucune borne fournie → on génère jusqu'à la limite maximale (exclusive)
            fin = new Date(limiteMax);
        }

        // 3. Valider la plage
        if (fin < debut) {
            throw new BadRequestException(
                'La date de fin de génération doit être postérieure à la date de début de validité du modèle.',
            );
        }
        if (fin > limiteMax) {
            throw new BadRequestException(
                `La génération ne peut pas dépasser ${MAX_MOIS} mois à partir du début de validité du modèle.`,
            );
        }

        // 4. Charger les données en parallèle
        const [pauses, indisponibilites, existingDatesArray, conflits] =
            await Promise.all([
                this.repo.findPausesByTechnicien(modele.technicienId),
                this.repo.findIndisponibilitesByTechnicien(modele.technicienId),
                this.repo.findCreneauxDateDebutByModele(
                    input.modeleId,
                    debut,
                    fin,
                ),
                this.repo.countCreneauxConflits(input.modeleId, debut, fin),
            ]);

        // Set pour la vérification d'idempotence en O(1)
        const existingDates = new Set(existingDatesArray);

        // 5. Algorithme de génération
        const batch: CreateCreneauData[] = [];
        let skipped = 0;

        const cursor = new Date(debut);

        // La borne fin est exclusive : on génère les jours strictement AVANT fin
        while (cursor < fin) {
            // Conversion JS day (0=dim) → modèle day (0=lun)
            const jourModele = (cursor.getUTCDay() + 6) % 7;

            if (jourModele === modele.jourSemaine) {
                // Vérifier si ce jour entier est couvert par une indisponibilité
                const estIndisponible = this.estJourIndisponible(
                    cursor,
                    indisponibilites,
                );

                const nbSlotsParJour = Math.floor(
                    (modele.heureFin - modele.heureDebut) /
                        modele.intervalleMinutes,
                );

                if (estIndisponible) {
                    skipped += nbSlotsParJour;
                } else {
                    // Générer les slots de la journée
                    for (
                        let heure = modele.heureDebut;
                        heure < modele.heureFin;
                        heure += modele.intervalleMinutes
                    ) {
                        // heure est en minutes depuis minuit, heure Paris locale.
                        // On calcule d'abord la date en traitant l'heure comme UTC,
                        // puis on soustrait l'offset Paris pour obtenir le vrai UTC.
                        const tempDate = new Date(cursor);
                        tempDate.setUTCHours(
                            Math.floor(heure / 60),
                            heure % 60,
                            0,
                            0,
                        );
                        const offsetMin = this.getParisOffsetMinutes(tempDate);
                        const slotDate = new Date(
                            tempDate.getTime() - offsetMin * 60000,
                        );
                        const slotIso = slotDate.toISOString();

                        // Filtrer les pauses
                        if (this.estDansPause(heure, jourModele, pauses)) {
                            skipped++;
                            continue;
                        }

                        // Idempotence : ignorer si déjà existant
                        if (existingDates.has(slotIso)) {
                            skipped++;
                            continue;
                        }

                        batch.push({
                            dateDebut: slotDate,
                            dateFin: null,
                            isDisponible: true,
                            zoneId: modele.zoneId,
                            modelePlanificationId: modele.id,
                        });
                    }
                }
            }

            // Avancer d'un jour
            cursor.setUTCDate(cursor.getUTCDate() + 1);
        }

        // 6. Insertion en masse
        const created =
            batch.length > 0 ? await this.repo.createManyCreneaux(batch) : 0;

        return { created, skipped, conflicts: conflits };
    }

    // ── Helpers privés ────────────────────────────────────────────────────────

    // Vérifie si un jour entier est couvert par au moins une indisponibilité
    private estJourIndisponible(
        jour: Date,
        indisponibilites: IndisponibiliteDto[],
    ): boolean {
        const jourDebut = new Date(jour);
        jourDebut.setUTCHours(0, 0, 0, 0);
        const jourFin = new Date(jour);
        jourFin.setUTCHours(23, 59, 59, 999);

        return indisponibilites.some((indispo) => {
            const indispoDebut = new Date(indispo.dateDebut);
            const indispoFin = new Date(indispo.dateFin);
            return indispoDebut <= jourFin && indispoFin >= jourDebut;
        });
    }

    // Retourne l'offset Europe/Paris en minutes pour une date donnée (+120 été, +60 hiver)
    private getParisOffsetMinutes(date: Date): number {
        const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const paris = new Date(
            date.toLocaleString('en-US', { timeZone: 'Europe/Paris' }),
        );
        return (paris.getTime() - utc.getTime()) / 60000;
    }

    // Vérifie si un slot (en minutes depuis minuit) tombe dans une pause applicable
    private estDansPause(
        heure: number, // minutes depuis minuit
        jourModele: number, // 0=lundi … 6=dimanche
        pauses: PauseRecurrenteDto[],
    ): boolean {
        return pauses.some((pause) => {
            // La pause s'applique si elle est quotidienne (null) ou sur ce jour précis
            const appliqueAuJour =
                pause.jourSemaine === null || pause.jourSemaine === jourModele;
            // Le slot est couvert si heure >= heureDebut ET heure < heureFin
            return (
                appliqueAuJour &&
                heure >= pause.heureDebut &&
                heure < pause.heureFin
            );
        });
    }
}
