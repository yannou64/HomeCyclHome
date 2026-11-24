import styles from './ActionsTechnicien.module.scss';

interface ActionsTechnicienProps {
    onPlanifier: () => void;
}

/**
 * Actions de la page d'un technicien : *Libérer le planning* et *Planifier*
 * (RG7 : chacun ouvre son propre écran). Sur la ligne de « ← Retour », à
 * droite, pour laisser la hauteur au planning (choix de Yannick du
 * 24/11/2026).
 *
 * *Libérer le planning* reste désactivé jusqu'à la livraison de « Libérer le
 * planning d'un technicien 2.0 » en S7 (écart du 24/11/2026, option A).
 */
export function ActionsTechnicien({ onPlanifier }: ActionsTechnicienProps) {
    return (
        <div className={styles.actions}>
            <button
                type="button"
                className={styles.boutonLiberer}
                disabled
                title="Disponible prochainement"
            >
                Libérer le planning
            </button>
            <button
                type="button"
                className={styles.boutonPlanifier}
                onClick={onPlanifier}
            >
                Planifier
            </button>
        </div>
    );
}
