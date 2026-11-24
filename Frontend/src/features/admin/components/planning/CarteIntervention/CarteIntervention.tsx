import type { InterventionTechnicien } from '../../../types/planning.types';
import { formaterHeure } from '../../../utils/blocsHoraires';
import styles from './CarteIntervention.module.scss';

interface CarteInterventionProps {
    intervention: InterventionTechnicien;
    numero: number; // « Intervention 1 », dans l'ordre des heures
}

/**
 * Une intervention du jour sur la page d'un technicien (US-02 « Consulter les
 * interventions d'un technicien 2.0 », maquette « Page d'un technicien ») :
 * ses heures, le forfait, le client, le cycle (marque et type), le contact et
 * l'adresse de l'intervention (RG4). Une En conflit qui a gardé ses créneaux
 * porte le repère « en conflit » (CA11). Lecture seule.
 */
export function CarteIntervention({
    intervention: i,
    numero,
}: CarteInterventionProps) {
    const enConflit = i.statut === 'EnConflit';
    const rue = [i.adresse.numero, i.adresse.rue].filter(Boolean).join(' ');

    return (
        <article
            className={`${styles.carte} ${enConflit ? styles.conflit : ''}`}
            aria-label={`Intervention ${numero}`}
        >
            <header className={styles.entete}>
                <h4 className={styles.titre}>Intervention {numero}</h4>
                <div className={styles.reperes}>
                    {enConflit && (
                        <span className={styles.badgeConflit}>en conflit</span>
                    )}
                    <span className={styles.badgeHeure}>
                        {formaterHeure(i.debut)} – {formaterHeure(i.fin)}
                    </span>
                </div>
            </header>

            {/* Liste de définitions : un libellé, une valeur */}
            <dl className={styles.details}>
                <dt>Forfait</dt>
                <dd>{i.forfait}</dd>
                <dt>Client</dt>
                <dd>
                    {i.client.prenom} {i.client.nom}
                </dd>
                <dt>Cycle</dt>
                <dd>
                    {i.cycle.marque} · {i.cycle.type}
                </dd>
                <dt>Contact</dt>
                <dd>
                    {i.client.telephone} · {i.client.email}
                </dd>
                <dt>Adresse</dt>
                <dd>
                    {rue}, {i.adresse.codePostal} {i.adresse.ville}
                </dd>
            </dl>
        </article>
    );
}
