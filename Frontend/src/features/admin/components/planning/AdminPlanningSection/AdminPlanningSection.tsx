import { useState } from 'react';
import { useCouvertureMois } from '../../../hooks/useCouvertureMois';
import type { TechnicienNomme } from '../../../types/planning.types';
import { CalendrierCouverture } from '../CalendrierCouverture/CalendrierCouverture';
import { JourneePivot } from '../JourneePivot/JourneePivot';
import { LegendeZones } from '../LegendeZones/LegendeZones';
import { PageTechnicien } from '../PageTechnicien/PageTechnicien';
import { PlanificationTechnicien } from '../PlanificationTechnicien/PlanificationTechnicien';
import styles from './AdminPlanningSection.module.scss';

// Ce que montre la section : la couverture, la page d'un technicien (par
// *Voir son planning*), ou sa planification (par *Planifier*)
type Vue =
    | { ecran: 'couverture' }
    | { ecran: 'technicien'; technicienId: string }
    | { ecran: 'planification'; technicien: TechnicienNomme };

/**
 * Section Planning de l'admin. La couverture des zones (« Visualiser la
 * couverture des zones 2.0 ») est centrée sur une date pivot : le calendrier
 * du mois et sa légende, puis la journée de la date pivot. Le bouton *Voir son planning*
 * d'un technicien ouvre sa page (« Consulter le planning d'un technicien
 * 2.0 »), d'où *Planifier* ouvre sa planification. La date pivot est gardée
 * d'un écran à l'autre.
 */
export function AdminPlanningSection() {
    const [vue, setVue] = useState<Vue>({ ecran: 'couverture' });
    // Mois demandé : null tant que l'admin n'a pas changé de mois (l'API
    // renvoie alors le mois du jour)
    const [mois, setMois] = useState<string | null>(null);
    // Date choisie dans le calendrier ; à défaut, la date du jour (RG4)
    const [dateChoisie, setDateChoisie] = useState<string | null>(null);
    const { couverture, error, reload } = useCouvertureMois(mois);

    const datePivot = dateChoisie ?? couverture?.aujourdHui ?? '';

    if (vue.ecran === 'technicien') {
        return (
            <PageTechnicien
                // key : un autre technicien remonte la page (dates réinitialisées)
                key={vue.technicienId}
                technicienId={vue.technicienId}
                dateInitiale={datePivot} // RG5, CA03
                onRetour={() => {
                    // Cette section reste montée pendant toute la navigation :
                    // sa couverture, chargée une fois, ne sait pas que des
                    // créneaux ont pu être générés depuis. On la recharge.
                    // (La journée pivot, démontée entre-temps, se recharge
                    // d'elle-même à son retour.)
                    reload();
                    setVue({ ecran: 'couverture' });
                }}
                onPlanifier={(technicien) =>
                    setVue({ ecran: 'planification', technicien })
                }
            />
        );
    }

    if (vue.ecran === 'planification') {
        return (
            <PlanificationTechnicien
                key={vue.technicien.id}
                technicien={vue.technicien}
                // Retour à la page du technicien, d'où l'on venait
                onRetour={() =>
                    setVue({
                        ecran: 'technicien',
                        technicienId: vue.technicien.id,
                    })
                }
            />
        );
    }

    // FullCalendar annonce aussi le mois de départ : on ne recharge que si
    // c'est un autre mois que celui déjà chargé
    const changerDeMois = (nouveau: string) => {
        if (nouveau !== couverture?.mois) setMois(nouveau);
    };

    return (
        <div className={styles.wrapper}>
            {/* Avant la couverture : le titre seul, et l'état. Ensuite, le
                titre entre dans la grille de la partie haute (JourneePivot),
                pour que le calendrier s'aligne sur lui */}
            {!couverture && (
                <>
                    <h2 className={styles.title}>Planning</h2>
                    {error ? (
                        <p className={styles.error}>{error}</p>
                    ) : (
                        <p className={styles.info}>Chargement…</p>
                    )}
                </>
            )}

            {/* La journée organise la page : calendrier et légende en haut,
                date et onglets sous la légende, cartes sur toute la largeur
                en dessous (choix de Yannick du 24/11/2026) */}
            {couverture && (
                <JourneePivot
                    date={datePivot}
                    onVoirPlanning={(technicienId) =>
                        setVue({ ecran: 'technicien', technicienId })
                    }
                    titre={<h2 className={styles.title}>Planning</h2>}
                    calendrier={
                        // Calendrier et légende dans le même cadre : la
                        // légende en colonne étroite à droite (choix de
                        // Yannick du 24/11/2026)
                        <div className={styles.carteCalendrier}>
                            <CalendrierCouverture
                                couverture={couverture}
                                datePivot={datePivot}
                                // Au retour d'une page technicien : le mois
                                // de la date pivot, pas celui du jour
                                dateInitiale={datePivot}
                                onMoisChange={changerDeMois}
                                onChoisirDate={setDateChoisie}
                                aere // il s'étend jusqu'au titre
                            />
                            <LegendeZones jours={couverture.jours} />
                        </div>
                    }
                />
            )}
        </div>
    );
}
