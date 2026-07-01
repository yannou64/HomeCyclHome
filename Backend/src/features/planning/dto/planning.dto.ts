import { ApiProperty } from '@nestjs/swagger';

export class ModelePlanificationDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    technicienId: string;

    @ApiProperty()
    zoneId: string;

    @ApiProperty({ description: '0=lundi, 1=mardi, 2=mercredi, 3=jeudi, 4=vendredi, 5=samedi, 6=dimanche' })
    jourSemaine: number;

    @ApiProperty({ description: 'Minutes depuis minuit : 510 = 8h30, 1020 = 17h00' })
    heureDebut: number;

    @ApiProperty()
    heureFin: number;

    @ApiProperty()
    intervalleMinutes: number;

    @ApiProperty()
    isActif: boolean;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebutValidite: string;

    @ApiProperty({ nullable: true, type: String, description: 'ISO 8601' })
    dateFinValidite: string | null;
}

export class PauseRecurrenteDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    technicienId: string;

    @ApiProperty({ nullable: true, type: Number, description: 'null = tous les jours, 0=lundi … 6=dimanche' })
    jourSemaine: number | null;

    @ApiProperty()
    heureDebut: number;

    @ApiProperty()
    heureFin: number;

    @ApiProperty({ nullable: true, type: String })
    description: string | null;
}

export class IndisponibiliteDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    technicienId: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebut: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateFin: string;

    @ApiProperty({ nullable: true, type: String })
    motif: string | null;
}

export class CreneauDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebut: string;

    @ApiProperty({ nullable: true, type: String, description: 'null à la génération, rempli à la réservation' })
    dateFin: string | null;

    @ApiProperty()
    isDisponible: boolean;

    @ApiProperty()
    zoneId: string;

    @ApiProperty({ nullable: true, type: String })
    modelePlanificationId: string | null;
}

export class CreneauDisponibleDto {
    @ApiProperty()
    id: string;

    @ApiProperty({ description: 'ISO 8601' })
    dateDebut: string;

    @ApiProperty({ description: 'ISO 8601 — dateDebut + dureeMinutes du forfait' })
    dateFin: string;

    @ApiProperty({ nullable: true, type: String, description: 'null si créneau sans modèle de planification' })
    technicienId: string | null;

    @ApiProperty()
    zoneId: string;
}

export class GenerationRapportDto {
    @ApiProperty({ description: 'Créneaux nouvellement insérés' })
    created: number;

    @ApiProperty({ description: 'Slots sautés (pause, indisponibilité, doublon)' })
    skipped: number;

    @ApiProperty({ description: 'Créneaux isDisponible=false dans la période (déjà réservés)' })
    conflicts: number;
}

// ── Types internes — jamais exposés directement via l'API ─────────────────────

export type CreateModeleData = Omit<
    ModelePlanificationDto,
    'id' | 'dateDebutValidite' | 'dateFinValidite'
> & {
    dateDebutValidite: Date;
    dateFinValidite: Date | null;
};

export type UpdateModeleData = Partial<
    Omit<
        ModelePlanificationDto,
        'id' | 'technicienId' | 'dateDebutValidite' | 'dateFinValidite'
    > & {
        dateDebutValidite: Date;
        dateFinValidite: Date | null;
    }
>;

export type CreatePauseData = Omit<PauseRecurrenteDto, 'id'>;

export type CreateIndisponibiliteData = {
    technicienId: string;
    dateDebut: Date;
    dateFin: Date;
    motif?: string;
};

// Étend CreneauDto avec technicienId résolu depuis la relation modele_planification
export type CreneauAvecTechnicienDto = CreneauDto & {
    technicienId: string | null;
    intervalleMinutes: number;
};

export type CreateCreneauData = {
    dateDebut: Date; // Date native — Prisma attend une Date, pas un string ISO
    dateFin: null; // toujours null à la génération
    isDisponible: true; // toujours disponible à la génération
    zoneId: string;
    modelePlanificationId: string;
};
