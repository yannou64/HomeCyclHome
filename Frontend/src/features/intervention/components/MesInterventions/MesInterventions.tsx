import { useState } from 'react';
import { useInterventions } from '../../hooks/useInterventions';
import { InterventionCard } from '../InterventionCard/InterventionCard';
import { CancelInterventionDialog } from '../CancelInterventionDialog/CancelInterventionDialog';
import type { InterventionClientDto } from '../../types/clientIntervention.types';
import styles from './MesInterventions.module.scss';

export function MesInterventions() {
    const { precedentes, aujourdhui, planifiees, isLoading, error, cancelIntervention } =
        useInterventions();

    const [cancelingIntervention, setCancelingIntervention] =
        useState<InterventionClientDto | null>(null);

    const handleConfirmCancel = async () => {
        if (!cancelingIntervention) return;
        await cancelIntervention(cancelingIntervention.id);
    };

    if (isLoading) {
        return <p className={styles.message}>Chargement de vos interventions…</p>;
    }

    if (error) {
        return <p className={styles.error}>{error}</p>;
    }

    const totalCount = precedentes.length + aujourdhui.length + planifiees.length;
    if (totalCount === 0) {
        return (
            <p className={styles.message}>
                Vous n&apos;avez pas encore d&apos;intervention.
            </p>
        );
    }

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.pageTitle}>Mes interventions</h2>

            {planifiees.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Planifiées</h3>
                    <div className={styles.list}>
                        {planifiees.map((intervention) => (
                            <InterventionCard
                                key={intervention.id}
                                intervention={intervention}
                                onCancel={() => setCancelingIntervention(intervention)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {aujourdhui.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Aujourd&apos;hui</h3>
                    <div className={styles.list}>
                        {aujourdhui.map((intervention) => (
                            <InterventionCard
                                key={intervention.id}
                                intervention={intervention}
                            />
                        ))}
                    </div>
                </section>
            )}

            {precedentes.length > 0 && (
                <section className={styles.section}>
                    <h3 className={styles.sectionTitle}>Précédentes</h3>
                    <div className={styles.list}>
                        {precedentes.map((intervention) => (
                            <InterventionCard
                                key={intervention.id}
                                intervention={intervention}
                            />
                        ))}
                    </div>
                </section>
            )}

            <CancelInterventionDialog
                intervention={cancelingIntervention}
                onClose={() => setCancelingIntervention(null)}
                onConfirm={handleConfirmCancel}
            />
        </div>
    );
}
