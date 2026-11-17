import type { CSSProperties } from 'react';
import styles from './PastilleCouleur.module.scss';

interface PastilleCouleurProps {
    hex: string; // teinte déjà calculée (couleurAffichee ou hexDeCouleur)
    taille?: 'petite' | 'grande';
    titre?: string; // infobulle au survol
}

/**
 * Rond de couleur. Purement décoratif pour les lecteurs d'écran (aria-hidden) :
 * le nom de la couleur ou de la zone est toujours donné à côté, en texte.
 */
export function PastilleCouleur({
    hex,
    taille = 'petite',
    titre,
}: PastilleCouleurProps) {
    // La teinte est une valeur calculée à l'exécution : elle passe par une
    // variable CSS, seul cas où un style inline est admis (Frontend/CLAUDE.md)
    const style = { '--pastille-couleur': hex } as CSSProperties;

    return (
        <span
            className={`${styles.pastille} ${styles[taille]}`}
            style={style}
            title={titre}
            aria-hidden="true"
        />
    );
}
