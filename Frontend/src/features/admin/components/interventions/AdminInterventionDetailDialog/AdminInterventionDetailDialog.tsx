import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import { useAdminInterventionDetail } from '../../../hooks/useAdminInterventionDetail';
import type { AdminInterventionStatut } from '../../../types/adminIntervention.types';
import styles from './AdminInterventionDetailDialog.module.scss';

interface AdminInterventionDetailDialogProps {
    id: string | null;
    onClose: () => void;
}

const STATUT_LABELS: Record<AdminInterventionStatut, string> = {
    Planifiee: 'Planifiée',
    Terminee: 'Terminée',
    Annulee: 'Annulée',
};

function formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function AdminInterventionDetailDialog({
    id,
    onClose,
}: AdminInterventionDetailDialogProps) {
    const { detail, isLoading, error } = useAdminInterventionDetail(id);

    return (
        <Dialog open={!!id} onOpenChange={onClose}>
            <DialogContent className={styles.content}>
                <DialogHeader>
                    <DialogTitle className={styles.title}>
                        Détail de l&apos;intervention
                    </DialogTitle>
                </DialogHeader>

                {isLoading && <p className={styles.loading}>Chargement…</p>}
                {!isLoading && error && <p className={styles.error}>{error}</p>}

                {!isLoading && detail && (
                    <div className={styles.body}>
                        {/* Statut + dates */}
                        <div className={styles.header}>
                            <span className={`${styles.badge} ${styles[`badge${detail.statut}`]}`}>
                                {STATUT_LABELS[detail.statut]}
                            </span>
                            <span className={styles.dateDebut}>
                                {formatDateTime(detail.dateDebut)}
                            </span>
                        </div>

                        <div className={styles.grid}>
                            {/* Client */}
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Client</h3>
                                <dl className={styles.dl}>
                                    <dt>Nom</dt>
                                    <dd>{detail.client.prenom} {detail.client.nom}</dd>
                                    <dt>Email</dt>
                                    <dd>{detail.client.email}</dd>
                                    <dt>Téléphone</dt>
                                    <dd>{detail.client.telephone}</dd>
                                    <dt>Adresse</dt>
                                    <dd>
                                        {detail.adresse.numero && `${detail.adresse.numero} `}
                                        {detail.adresse.rue}<br />
                                        {detail.adresse.codePostal} {detail.adresse.ville}
                                    </dd>
                                </dl>
                            </section>

                            {/* Intervention */}
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Intervention</h3>
                                <dl className={styles.dl}>
                                    <dt>Forfait</dt>
                                    <dd>{detail.forfaitNom} ({detail.dureeMinutesSnapshot} min)</dd>
                                    <dt>Zone</dt>
                                    <dd>{detail.zone.nom}</dd>
                                    <dt>Technicien</dt>
                                    <dd>
                                        {detail.technicien
                                            ? `${detail.technicien.prenom} ${detail.technicien.nom}`
                                            : <span className={styles.unassigned}>Non assigné</span>}
                                    </dd>
                                    <dt>Vélo</dt>
                                    <dd>{detail.cycle.libelle} — {detail.cycle.marque} · {detail.cycle.type}</dd>
                                </dl>
                            </section>
                        </div>

                        {/* Commentaire */}
                        {detail.commentaire && (
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Commentaire</h3>
                                <p className={styles.commentaire}>{detail.commentaire}</p>
                            </section>
                        )}

                        {/* Photos client */}
                        {detail.photosClient.length > 0 && (
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Photos client</h3>
                                <div className={styles.photosGrid}>
                                    {detail.photosClient.map((p) => (
                                        <a
                                            key={p.id}
                                            href={p.url_s3}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.photoLink}
                                        >
                                            <img
                                                src={p.url_s3}
                                                alt="Photo client"
                                                className={styles.photo}
                                            />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Photos technicien */}
                        {detail.photosTechnicien.length > 0 && (
                            <section className={styles.section}>
                                <h3 className={styles.sectionTitle}>Photos technicien</h3>
                                <div className={styles.photosGrid}>
                                    {detail.photosTechnicien.map((p) => (
                                        <a
                                            key={p.id}
                                            href={p.url_s3}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.photoLink}
                                        >
                                            <img
                                                src={p.url_s3}
                                                alt="Photo technicien"
                                                className={styles.photo}
                                            />
                                        </a>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
