import { useState } from 'react';
import { useCouvertureMois } from '../../../hooks/useCouvertureMois';
import { useTechniciens } from '../../../hooks/useTechniciens';
import { CalendrierCouverture } from '../CalendrierCouverture/CalendrierCouverture';
import { ChoixTechnicien } from '../ChoixTechnicien/ChoixTechnicien';
import { LegendeZones } from '../LegendeZones/LegendeZones';
import { PlanificationTechnicien } from '../PlanificationTechnicien/PlanificationTechnicien';
import styles from './AdminPlanningSection.module.scss';

/**
 * Section Planning de l'admin : la couverture des zones (« Visualiser la
 * couverture des zones 2.0 »), centrée sur une date pivot. US-01 : le
 * calendrier du mois et sa légende ; la journée de la date pivot arrive avec
 * US-02. En attendant le bouton *Détail* (S3), un sélecteur donne accès à
 * l'écran Planification d'un technicien.
 */
export function AdminPlanningSection() {
    const { techniciens, error: erreurTechniciens } = useTechniciens();
    const [technicienId, setTechnicienId] = useState('');
    // Mois demandé : null tant que l'admin n'a pas changé de mois (l'API
    // renvoie alors le mois du jour)
    const [mois, setMois] = useState<string | null>(null);
    // Date choisie dans le calendrier ; à défaut, la date du jour (RG4)
    const [dateChoisie, setDateChoisie] = useState<string | null>(null);
    const { couverture, error } = useCouvertureMois(mois);

    const technicien = techniciens.find((t) => t.id === technicienId);
    if (technicien) {
        // key : un autre technicien remonte l'écran (formulaire réinitialisé)
        return (
            <PlanificationTechnicien
                key={technicien.id}
                technicien={technicien}
                onRetour={() => setTechnicienId('')}
            />
        );
    }

    const datePivot = dateChoisie ?? couverture?.aujourdHui ?? '';

    // FullCalendar annonce aussi le mois de départ : on ne recharge que si
    // c'est un autre mois que celui déjà chargé
    const changerDeMois = (nouveau: string) => {
        if (nouveau !== couverture?.mois) setMois(nouveau);
    };

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Planning</h2>

            {error && <p className={styles.error}>{error}</p>}
            {!couverture && !error && (
                <p className={styles.info}>Chargement…</p>
            )}

            {couverture && (
                <div className={styles.haut}>
                    <div className={styles.carteCalendrier}>
                        <CalendrierCouverture
                            couverture={couverture}
                            datePivot={datePivot}
                            onMoisChange={changerDeMois}
                            onChoisirDate={setDateChoisie}
                        />
                    </div>
                    <LegendeZones jours={couverture.jours} />
                </div>
            )}

            <ChoixTechnicien
                techniciens={techniciens}
                onChoisir={setTechnicienId}
                erreur={erreurTechniciens}
            />
        </div>
    );
}
