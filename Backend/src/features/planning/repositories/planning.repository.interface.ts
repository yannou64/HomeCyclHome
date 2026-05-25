import {
    CreateIndisponibiliteData,
    CreateModeleData,
    CreatePauseData,
    IndisponibiliteDto,
    ModelePlanificationDto,
    PauseRecurrenteDto,
    UpdateModeleData,
} from '../dto/planning.dto';

export const PLANNING_REPO = 'PLANNING_REPO';

export interface IPlanningRepository {
    // ── ModelePlanification ──────────────────────────────────────────────────

    findModelesByTechnicien(technicienId: string): Promise<ModelePlanificationDto[]>;
    findModeleById(id: string): Promise<ModelePlanificationDto | null>;

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
    ): Promise<ModelePlanificationDto[]>;

    createModele(data: CreateModeleData): Promise<ModelePlanificationDto>;
    updateModele(id: string, data: UpdateModeleData): Promise<ModelePlanificationDto>;
    deleteModele(id: string): Promise<void>;

    // ── PauseRecurrente ──────────────────────────────────────────────────────

    findPausesByTechnicien(technicienId: string): Promise<PauseRecurrenteDto[]>;
    findPauseById(id: string): Promise<PauseRecurrenteDto | null>;
    createPause(data: CreatePauseData): Promise<PauseRecurrenteDto>;
    deletePause(id: string): Promise<void>;

    // ── Indisponibilite ──────────────────────────────────────────────────────

    findIndisponibilitesByTechnicien(technicienId: string): Promise<IndisponibiliteDto[]>;
    findIndisponibiliteById(id: string): Promise<IndisponibiliteDto | null>;
    createIndisponibilite(data: CreateIndisponibiliteData): Promise<IndisponibiliteDto>;
    deleteIndisponibilite(id: string): Promise<void>;

    // ── Vérifications partagées ──────────────────────────────────────────────

    // Vérifie que l'utilisateur existe ET a le rôle 'technicien'
    technicienExists(technicienId: string): Promise<boolean>;
    // Vérifie que la ligne TechnicienZone existe pour cette paire
    isAffecteAZone(technicienId: string, zoneId: string): Promise<boolean>;
}