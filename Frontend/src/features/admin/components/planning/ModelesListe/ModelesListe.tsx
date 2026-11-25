import type { ModeleResume } from '../../../types/planning.types';
import { CarteModele } from '../CarteModele/CarteModele';
import styles from './ModelesListe.module.scss';

interface ModelesListeProps {
    modeles: ModeleResume[];
    onOuvrir: (modeleId: string) => void;
    onSupprimer: (modeleId: string) => void; // ouvre la confirmation (US-03)
}

/**
 * Modèles d'un technicien sur la page Planification, en cartes de largeur
 * fixe, centrées (comme la rangée de cartes de la page Planning). Un modèle
 * valide s'ouvre ; un modèle invalide ne peut que se supprimer (CarteModele).
 */
export function ModelesListe({
    modeles,
    onOuvrir,
    onSupprimer,
}: ModelesListeProps) {
    return (
        <ul className={styles.liste}>
            {modeles.map((m) => (
                <li key={m.id} className={styles.element}>
                    <CarteModele
                        modele={m}
                        onOuvrir={() => onOuvrir(m.id)}
                        onSupprimer={() => onSupprimer(m.id)}
                    />
                </li>
            ))}
        </ul>
    );
}
