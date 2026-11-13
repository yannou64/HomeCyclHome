import {
    CreneauAvecTechnicien,
    CreneauResponseDto,
} from '../dto/output/creneau-response.dto';
import { IndisponibiliteResponseDto } from '../dto/output/indisponibilite-response.dto';
import { ModelePlanificationResponseDto } from '../dto/output/modele-planification-response.dto';
import { PauseRecurrenteResponseDto } from '../dto/output/pause-recurrente-response.dto';

export const PLANNING_REPO = 'PLANNING_REPO';

export interface IPlanningRepository {
    // ── ModelePlanification ──────────────────────────────────────────────────

    findModelesByTechnicien(
        technicienId: string,
    ): Promise<ModelePlanificationResponseDto[]>;
    findModeleById(id: string): Promise<ModelePlanificationResponseDto | null>;

    // Retourne les modèles du même technicien qui se chevauchent avec le candidat.
    // excludeId permet d'exclure le modèle en cours de modification (cas update).
    findModelesChevauchants(
        technicienId: string,
        jourSemaine: number,
        heureDebut: number,
        heureFin: number,
        dateDebutValidite: Date,
        dateFinValidite: Date | null,
        excludeId?: string,
    ): Promise<ModelePlanificationResponseDto[]>;

    createModele(
        data: CreateModeleData,
    ): Promise<ModelePlanificationResponseDto>;
    updateModele(
        id: string,
        data: UpdateModeleData,
    ): Promise<ModelePlanificationResponseDto>;
    deleteModele(id: string): Promise<void>;

    // ── PauseRecurrente ──────────────────────────────────────────────────────

    findPausesByTechnicien(
        technicienId: string,
    ): Promise<PauseRecurrenteResponseDto[]>;
    findPauseById(id: string): Promise<PauseRecurrenteResponseDto | null>;
    createPause(data: CreatePauseData): Promise<PauseRecurrenteResponseDto>;
    deletePause(id: string): Promise<void>;

    // ── Indisponibilite ──────────────────────────────────────────────────────

    findIndisponibilitesByTechnicien(
        technicienId: string,
    ): Promise<IndisponibiliteResponseDto[]>;
    findIndisponibiliteById(
        id: string,
    ): Promise<IndisponibiliteResponseDto | null>;
    createIndisponibilite(
        data: CreateIndisponibiliteData,
    ): Promise<IndisponibiliteResponseDto>;
    deleteIndisponibilite(id: string): Promise<void>;

    // ── Vérifications partagées ──────────────────────────────────────────────

    // Vérifie que l'utilisateur existe ET a le rôle 'technicien'
    technicienExists(technicienId: string): Promise<boolean>;
    // Vérifie que la ligne TechnicienZone existe pour cette paire
    isAffecteAZone(technicienId: string, zoneId: string): Promise<boolean>;

    // ── Creneau ─────────────────────────────────────────────────────────────

    // Idempotence : retourne les date_debut (ISO) des créneaux déjà générés
    // pour ce modèle sur la période → le use case construit un Set pour les ignorer
    findCreneauxDateDebutByModele(
        modeleId: string,
        debut: Date,
        fin: Date,
    ): Promise<string[]>;

    // Conflits : nombre de créneaux réservés (is_disponible=false) dans la période
    // → signalés dans le rapport de génération, non supprimés
    countCreneauxConflits(
        modeleId: string,
        debut: Date,
        fin: Date,
    ): Promise<number>;

    // Insertion en masse (un seul appel DB pour toute la période générée)
    createManyCreneaux(data: CreateCreneauData[]): Promise<number>;

    // Récupération pour l'affichage admin, filtrée par technicien + plage de dates
    findCreneauxByTechnicien(
        technicienId: string,
        debut: Date,
        fin: Date,
    ): Promise<CreneauResponseDto[]>;

    findCreneauById(id: string): Promise<CreneauResponseDto | null>;

    // Retourne TOUS les créneaux d'une zone sur une période (disponibles ET non disponibles)
    // Inclut technicien_id via la relation modele_planification — utilisé par le tunnel client
    findCreneauxByZone(
        zoneId: string,
        debut: Date,
        fin: Date,
    ): Promise<CreneauAvecTechnicien[]>;

    deleteCreneau(id: string): Promise<void>;

    // Suppression en masse des créneaux disponibles sur une période
    // → ne touche pas aux créneaux réservés (is_disponible=false)
    deleteCreneauxDisponibles(
        technicienId: string,
        debut: Date,
        fin: Date,
    ): Promise<number>;
}

export type CreateModeleData = Omit<
    ModelePlanificationResponseDto,
    'id' | 'dateDebutValidite' | 'dateFinValidite'
> & {
    dateDebutValidite: Date;
    dateFinValidite: Date | null;
};

export type UpdateModeleData = Partial<
    Omit<
        ModelePlanificationResponseDto,
        'id' | 'technicienId' | 'dateDebutValidite' | 'dateFinValidite'
    > & {
        dateDebutValidite: Date;
        dateFinValidite: Date | null;
    }
>;

export type CreatePauseData = Omit<PauseRecurrenteResponseDto, 'id'>;

export type CreateIndisponibiliteData = {
    technicienId: string;
    dateDebut: Date;
    dateFin: Date;
    motif?: string;
};

export type CreateCreneauData = {
    dateDebut: Date; // Date native — Prisma attend une Date, pas un string ISO
    dateFin: null; // toujours null à la génération
    isDisponible: true; // toujours disponible à la génération
    zoneId: string;
    modelePlanificationId: string;
};
