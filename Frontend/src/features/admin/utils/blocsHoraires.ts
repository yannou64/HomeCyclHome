import type { BlocHoraire } from '../types/planning.types';

// Règles d'un bloc horaire côté interface (séquence de « Créer un modèle »,
// étape 10 : la page refuse une plage ou un chevauchement invalide dès la
// saisie). Le serveur refait tous ces contrôles : ici, c'est du confort.

const DEBUT_JOURNEE = 7 * 60; // 7h00
const FIN_JOURNEE = 20 * 60; // 20h00
const PAS = 30;

/** Heures proposées : 7h00, 7h30, … 20h00 (en minutes depuis minuit). */
export const HEURES_PROPOSEES: number[] = Array.from(
    { length: (FIN_JOURNEE - DEBUT_JOURNEE) / PAS + 1 },
    (_, i) => DEBUT_JOURNEE + i * PAS,
);

/** 480 → « 8:00 », 810 → « 13:30 » (format du wireframe). */
export function formaterHeure(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
}

/**
 * Message d'erreur si le bloc est invalide parmi les autres, sinon null.
 * Deux blocs contigus (8:00–10:00 puis 10:00–12:00) ne se chevauchent pas.
 */
export function erreurBloc(
    bloc: BlocHoraire,
    autres: BlocHoraire[],
): string | null {
    if (bloc.fin <= bloc.debut) {
        return 'La fin du bloc doit être après son début.';
    }
    const conflit = autres.find(
        (b) => bloc.debut < b.fin && b.debut < bloc.fin,
    );
    if (conflit) {
        return `Ce bloc chevauche le bloc ${formaterHeure(conflit.debut)} – ${formaterHeure(conflit.fin)}.`;
    }
    return null;
}

/** Erreur de chaque bloc, comparé à tous les autres (null si valide). */
export function erreursBlocs(blocs: BlocHoraire[]): (string | null)[] {
    return blocs.map((b, i) =>
        erreurBloc(
            b,
            blocs.filter((_, j) => j !== i),
        ),
    );
}

/**
 * Bloc proposé par « Ajouter un bloc » : il commence à la fin du dernier bloc
 * (8h00 pour le premier) et dure 2 h, sans dépasser 20h00. Null si la
 * journée est déjà remplie jusqu'à 20h00.
 */
export function blocSuivant(blocs: BlocHoraire[]): BlocHoraire | null {
    const debut = blocs.length ? Math.max(...blocs.map((b) => b.fin)) : 8 * 60;
    if (debut >= FIN_JOURNEE) return null;
    return { debut, fin: Math.min(debut + 120, FIN_JOURNEE) };
}

/**
 * Première erreur d'une saisie de modèle, dans l'ordre du formulaire, ou null.
 * Contrôles de confort avant l'envoi : le serveur refait tout et a le dernier
 * mot (son message s'affiche s'il refuse).
 */
export function erreurSaisieModele(saisie: {
    intitule: string;
    zoneId: string;
    jours: unknown[];
    blocs: BlocHoraire[];
}): string | null {
    if (!saisie.intitule.trim()) return 'L’intitulé est obligatoire.';
    if (!saisie.zoneId) return 'Choisissez une zone.';
    if (saisie.jours.length === 0) {
        return 'Choisissez au moins un jour de la semaine.';
    }
    if (saisie.blocs.length === 0) return 'Ajoutez au moins un bloc horaire.';
    if (erreursBlocs(saisie.blocs).some(Boolean)) {
        return 'Corrigez les blocs horaires signalés.';
    }
    return null;
}
