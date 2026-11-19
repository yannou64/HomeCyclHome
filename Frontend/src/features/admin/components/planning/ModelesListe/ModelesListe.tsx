import type { ModeleResume } from '../../../types/planning.types';
import {
    GRIS_ZONE_INACTIVE,
    hexDeCouleur,
} from '../../../../../shared/utils/couleursZones';
import { PastilleCouleur } from '../../zones/PastilleCouleur/PastilleCouleur';
import styles from './ModelesListe.module.scss';

interface ModelesListeProps {
    modeles: ModeleResume[];
    onOuvrir: (modeleId: string) => void;
}

/**
 * Liste des modèles d'un technicien, sur la page Planification.
 * - Un modèle valide est un lien : il ouvre l'écran du modèle.
 * - Un modèle invalide (zone plus affectée au technicien, ou inactive) est
 *   marqué en rouge avec un libellé, et son lien est inactif : on ne l'ouvre
 *   ni ne le modifie (RG11). Le lien de suppression arrive avec US-03.
 */
export function ModelesListe({ modeles, onOuvrir }: ModelesListeProps) {
    return (
        <ul className={styles.liste}>
            {modeles.map((m) => (
                <li key={m.id} className={styles.modele}>
                    {m.valide ? (
                        <button
                            type="button"
                            className={styles.lien}
                            onClick={() => onOuvrir(m.id)}
                        >
                            <PastilleCouleur
                                hex={hexDeCouleur(m.zone.couleur)}
                                titre={m.zone.couleur}
                            />
                            <span className={styles.intitule}>
                                {m.intitule}
                            </span>
                            <span className={styles.zone}>
                                {m.zone.nomZone}
                            </span>
                        </button>
                    ) : (
                        // Pas de bouton : un lien inactif n'est pas un élément
                        // interactif, il n'est ni cliquable ni focusable
                        <span className={styles.invalide}>
                            <PastilleCouleur hex={GRIS_ZONE_INACTIVE} />
                            <span className={styles.intitule}>
                                {m.intitule}
                            </span>
                            <span className={styles.zone}>
                                {m.zone.nomZone}
                            </span>
                            <span className={styles.libelleInvalide}>
                                Zone non valide
                            </span>
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}
