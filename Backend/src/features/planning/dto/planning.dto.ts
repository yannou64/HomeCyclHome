// DTOs de sortie — types simples, pas de décorateurs class-validator
// Ces types représentent ce que l'API retourne au frontend

export type ModelePlanificationDto = {
    id: string;
    technicien_id: string;
    zone_id: string;
    // 0=lundi, 1=mardi, 2=mercredi, 3=jeudi, 4=vendredi, 5=samedi, 6=dimanche
    jour_semaine: number;
    // Minutes depuis minuit : 510 = 8h30, 1020 = 17h00
    heure_debut: number;
    heure_fin: number;
    intervalle_minutes: number;
    is_actif: boolean;
    date_debut_validite: string; // ISO 8601
    date_fin_validite: string | null;
};

export type PauseRecurrenteDto = {
    id: string;
    technicien_id: string;
    // null = tous les jours, 0=lundi … 6=dimanche
    jour_semaine: number | null;
    heure_debut: number;
    heure_fin: number;
    description: string | null;
};

export type IndisponibiliteDto = {
    id: string;
    technicien_id: string;
    date_debut: string; // ISO 8601
    date_fin: string;   // ISO 8601
    motif: string | null;
};

// Types intermédiaires utilisés par l'interface repository
// Séparés des DTOs d'entrée HTTP pour que le repository reste indépendant de NestJS

export type CreateModeleData =
    Omit<ModelePlanificationDto, 'id' | 'date_debut_validite' | 'date_fin_validite'> & {
        date_debut_validite: Date;
        date_fin_validite: Date | null;
    };

export type UpdateModeleData = Partial<
    Omit<ModelePlanificationDto, 'id' | 'technicien_id' | 'date_debut_validite' | 'date_fin_validite'> & {
        date_debut_validite: Date;
        date_fin_validite: Date | null;
    }
>;

export type CreatePauseData = Omit<PauseRecurrenteDto, 'id'>;

export type CreateIndisponibiliteData = {
    technicien_id: string;
    date_debut: Date;
    date_fin: Date;
    motif?: string;
};