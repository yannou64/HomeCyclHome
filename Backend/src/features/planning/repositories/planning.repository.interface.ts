import {
    CreateCreneauData,
    CreateIndisponibiliteData,
    CreateModeleData,
    CreatePauseData,
    CreneauDto,
    IndisponibiliteDto,
    ModelePlanificationDto,
    PauseRecurrenteDto,
    UpdateModeleData,
} from '../dto/planning.dto';

export const PLANNING_REPO = 'PLANNING_REPO';

export interface IPlanningRepository {
    // ── ModelePlanification ──────────────────────────────────────────────────

    findModelesByTechnicien(
        technicienId: string,
    ): Promise<ModelePlanificationDto[]>;
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
    updateModele(
        id: string,
        data: UpdateModeleData,
    ): Promise<ModelePlanificationDto>;
    deleteModele(id: string): Promise<void>;

    // ── PauseRecurrente ──────────────────────────────────────────────────────

    findPausesByTechnicien(technicienId: string): Promise<PauseRecurrenteDto[]>;
    findPauseById(id: string): Promise<PauseRecurrenteDto | null>;
    createPause(data: CreatePauseData): Promise<PauseRecurrenteDto>;
    deletePause(id: string): Promise<void>;

    // ── Indisponibilite ──────────────────────────────────────────────────────

    findIndisponibilitesByTechnicien(
        technicienId: string,
    ): Promise<IndisponibiliteDto[]>;
    findIndisponibiliteById(id: string): Promise<IndisponibiliteDto | null>;
    createIndisponibilite(
        data: CreateIndisponibiliteData,
    ): Promise<IndisponibiliteDto>;
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
    ): Promise<CreneauDto[]>;

    findCreneauById(id: string): Promise<CreneauDto | null>;
    deleteCreneau(id: string): Promise<void>;

    // Suppression en masse des créneaux disponibles sur une période
    // → ne touche pas aux créneaux réservés (is_disponible=false)
    deleteCreneauxDisponibles(
        technicienId: string,
        debut: Date,
        fin: Date,
    ): Promise<number>;
}
