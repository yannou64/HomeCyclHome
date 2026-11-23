import type { ReactNode } from 'react';
import type {
    BlocHoraire,
    JourSemaine,
    ZoneProposee,
} from '../../../types/planning.types';
import {
    GRIS_ZONE_INACTIVE,
    hexDeCouleur,
} from '../../../../../shared/utils/couleursZones';
import { BlocsHorairesEditeur } from '../BlocsHorairesEditeur/BlocsHorairesEditeur';
import { FriseJournee } from '../FriseJournee/FriseJournee';
import { JoursSemaineChoix } from '../JoursSemaineChoix/JoursSemaineChoix';
import { ZoneChoix } from '../ZoneChoix/ZoneChoix';
import styles from './SaisiePlanification.module.scss';

/** Les trois valeurs communes à un modèle et à une planification. */
export type ValeursSaisie = {
    zoneId: string;
    jours: JourSemaine[];
    blocs: BlocHoraire[];
};

interface SaisiePlanificationProps {
    zones: ZoneProposee[];
    zonesError: string | null;
    valeurs: ValeursSaisie;
    // Une seule fonction de mise à jour : le parent garde l'état, ce composant
    // ne fait qu'afficher et remonter les changements (composant « contrôlé »)
    onChange: (valeurs: ValeursSaisie) => void;
    disabled?: boolean;
    // Champs propres à l'écran, en tête de la colonne de gauche : le titre
    // d'un modèle ; plus tard, la période d'une planification (US-02)
    children?: ReactNode;
}

/**
 * Saisie partagée par le formulaire d'un modèle et par l'écran de
 * planification (« Planifier un technicien 2.0 », conception du 23/11/2026) :
 * à gauche la zone, les jours et les blocs ; à droite la journée type de 7h
 * à 20h, dans la couleur de la zone choisie. Disposition desktop en deux
 * colonnes, choisie par Yannick le 18/11/2026.
 */
export function SaisiePlanification({
    zones,
    zonesError,
    valeurs,
    onChange,
    disabled,
    children,
}: SaisiePlanificationProps) {
    // Couleur calculée au rendu, jamais stockée : elle découle de la zone
    // choisie (gris tant qu'aucune zone n'est choisie)
    const zone = zones.find((z) => z.id === valeurs.zoneId);
    const couleur = zone ? hexDeCouleur(zone.couleur) : GRIS_ZONE_INACTIVE;

    return (
        <div className={styles.colonnes}>
            <div className={styles.formulaire}>
                {children}
                <ZoneChoix
                    zones={zones}
                    valeur={valeurs.zoneId}
                    couleur={couleur}
                    // On recopie les autres valeurs et on remplace la zone
                    onChange={(zoneId) => onChange({ ...valeurs, zoneId })}
                    erreur={zonesError}
                    disabled={disabled}
                />
                <JoursSemaineChoix
                    valeur={valeurs.jours}
                    onChange={(jours) => onChange({ ...valeurs, jours })}
                    disabled={disabled}
                />
                <BlocsHorairesEditeur
                    valeur={valeurs.blocs}
                    onChange={(blocs) => onChange({ ...valeurs, blocs })}
                    disabled={disabled}
                />
            </div>

            <aside
                className={styles.apercu}
                aria-label="Aperçu de la journée type"
            >
                <p className={styles.label}>Journée type</p>
                <FriseJournee blocs={valeurs.blocs} couleur={couleur} />
            </aside>
        </div>
    );
}
