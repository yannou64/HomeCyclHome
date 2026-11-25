import type { CSSProperties } from 'react';
import {
    JOURS_SEMAINE,
    type ModeleResume,
} from '../../../types/planning.types';
import { formaterHeure } from '../../../utils/blocsHoraires';
import {
    GRIS_ZONE_INACTIVE,
    hexDeCouleur,
} from '../../../../../shared/utils/couleursZones';
import styles from './CarteModele.module.scss';

interface CarteModeleProps {
    modele: ModeleResume;
    onOuvrir: () => void;
    onSupprimer: () => void; // modèle invalide : ouvre la confirmation
}

/** « lundi » → « L ». */
const initiale = (jour: string) => jour.charAt(0).toUpperCase();

/** Durée travaillée par jour, blocs cumulés : 480 → « 8 h », 450 → « 7 h 30 ». */
function dureeParJour(blocs: ModeleResume['blocs']): string {
    const minutes = blocs.reduce((total, b) => total + (b.fin - b.debut), 0);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`;
}

/**
 * Un modèle sur la page Planification d'un technicien, en carte (sur le
 * modèle des cartes de la page Planning, choix de Yannick du 25/11/2026) :
 * son intitulé et sa zone, puis ce qui le situe sans l'ouvrir : ses jours,
 * ses blocs horaires et la durée travaillée par jour.
 *
 * - Modèle valide : toute la carte est un bouton, qui ouvre l'écran du
 *   modèle.
 * - Modèle invalide (zone plus affectée au technicien, ou inactive) : carte
 *   bordée de rouge avec un libellé, non cliquable ; seul son lien *Supprimer*
 *   reste actif (RG15, CA06 de l'US-01).
 */
export function CarteModele({
    modele: m,
    onOuvrir,
    onSupprimer,
}: CarteModeleProps) {
    const couleur = m.valide
        ? hexDeCouleur(m.zone.couleur)
        : GRIS_ZONE_INACTIVE;

    const contenu = (
        <>
            <span className={styles.entete}>
                <span className={styles.intitule}>{m.intitule}</span>
                <span
                    className={styles.badge}
                    // Teinte de la zone (gris si le modèle est invalide)
                    style={{ '--badge-couleur': couleur } as CSSProperties}
                >
                    {m.zone.nomZone}
                </span>
            </span>

            {/* Les sept jours, actifs ou grisés */}
            <span
                className={styles.jours}
                // role="img" : sans rôle, un aria-label sur un span est ignoré
                role="img"
                aria-label={`Jours : ${m.jours.join(', ')}`}
            >
                {JOURS_SEMAINE.map((j) => (
                    <span
                        key={j}
                        className={`${styles.jour} ${
                            m.jours.includes(j) ? styles.jourActif : ''
                        }`}
                        aria-hidden
                    >
                        {initiale(j)}
                    </span>
                ))}
            </span>

            <span className={styles.blocs}>
                {m.blocs
                    .map(
                        (b) =>
                            `${formaterHeure(b.debut)}–${formaterHeure(b.fin)}`,
                    )
                    .join(' · ')}
            </span>
            <span className={styles.duree}>
                {dureeParJour(m.blocs)} par jour
            </span>
        </>
    );

    if (m.valide) {
        return (
            <button type="button" className={styles.carte} onClick={onOuvrir}>
                {contenu}
            </button>
        );
    }

    return (
        <article className={`${styles.carte} ${styles.invalide}`}>
            {contenu}
            <span className={styles.piedInvalide}>
                <span className={styles.libelleInvalide}>Zone non valide</span>
                <button
                    type="button"
                    className={styles.lienSupprimer}
                    onClick={onSupprimer}
                >
                    Supprimer
                </button>
            </span>
        </article>
    );
}
