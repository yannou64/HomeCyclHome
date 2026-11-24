import { useState } from 'react';
import { usePageTechnicien } from '../../../hooks/usePageTechnicien';
import type { TechnicienNomme } from '../../../types/planning.types';
import { ActionsTechnicien } from '../ActionsTechnicien/ActionsTechnicien';
import { CalendrierCouverture } from '../CalendrierCouverture/CalendrierCouverture';
import { InterventionsDuJour } from '../InterventionsDuJour/InterventionsDuJour';
import { ReperesTechnicien } from '../ReperesTechnicien/ReperesTechnicien';
import { JourneeTechnicien } from '../JourneeTechnicien/JourneeTechnicien';
import styles from './PageTechnicien.module.scss';

interface PageTechnicienProps {
    technicienId: string;
    // RG5 : la date sélectionnée sur la page de couverture (CA03)
    dateInitiale: string;
    onRetour: () => void;
    onPlanifier: (technicien: TechnicienNomme) => void;
}

/**
 * Page d'un technicien (US-01 « Consulter le calendrier et la journée d'un
 * technicien 2.0 », maquette « Page d'un technicien ») : en-tête et boutons,
 * son calendrier (un point par jour planifié), sa journée du jour choisi, et
 * ses interventions de ce jour (US-02 « Consulter les interventions d'un
 * technicien 2.0 »).
 * Lecture seule (RG7).
 */
export function PageTechnicien({
    technicienId,
    dateInitiale,
    onRetour,
    onPlanifier,
}: PageTechnicienProps) {
    // Jour affiché et mois du calendrier : au départ, ceux de la date pivot
    const [date, setDate] = useState(dateInitiale);
    const [mois, setMois] = useState(dateInitiale.slice(0, 7));
    const {
        calendrier,
        journee,
        interventions,
        isLoadingInterventions,
        error,
    } = usePageTechnicien(technicienId, mois, date);

    const technicien = calendrier?.technicien;
    const nom = technicien ? `${technicien.prenom} ${technicien.nom}` : '';

    return (
        <div className={styles.wrapper}>
            {/* « ← Retour » en haut à gauche (règles d'interface) ; sur la
                même ligne, à droite, les actions : la hauteur reste au
                planning (choix de Yannick du 24/11/2026) */}
            <div className={styles.barreHaut}>
                <button
                    type="button"
                    className={styles.retour}
                    onClick={onRetour}
                >
                    ← Retour
                </button>
                {technicien && (
                    <ActionsTechnicien
                        onPlanifier={() => onPlanifier(technicien)}
                    />
                )}
            </div>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
            {!calendrier && !error && (
                <p className={styles.info}>Chargement…</p>
            )}

            {calendrier && technicien && (
                <>
                    {/* Gauche : nom, calendrier, puis interventions du jour ;
                        droite : la journée, du haut du nom vers le bas
                        (choix de Yannick du 24/11/2026) */}
                    <div className={styles.grille}>
                        <div className={styles.gauche}>
                            {/* En haut de la colonne de gauche : la journée,
                                à droite, commence à la hauteur du nom */}
                            <h2 className={styles.nom}>{nom}</h2>
                            <div className={styles.carteCalendrier}>
                                <CalendrierCouverture
                                    couverture={calendrier}
                                    datePivot={date}
                                    dateInitiale={dateInitiale}
                                    // FullCalendar annonce aussi le mois de
                                    // départ : on ne recharge que pour un
                                    // autre mois (RG6)
                                    onMoisChange={(m) =>
                                        m !== mois && setMois(m)
                                    }
                                    onChoisirDate={setDate} // CA07
                                />
                                {/* À la place du texte d'aide : « planifié
                                    jusqu'au », puis la zone du jour */}
                                <ReperesTechnicien journee={journee} />
                            </div>

                            {/* US-02 : la liste du jour choisi, sous le
                                calendrier */}
                            <InterventionsDuJour
                                interventions={interventions}
                                isLoading={isLoadingInterventions}
                            />
                        </div>

                        <JourneeTechnicien date={date} journee={journee} />
                    </div>
                </>
            )}
        </div>
    );
}
