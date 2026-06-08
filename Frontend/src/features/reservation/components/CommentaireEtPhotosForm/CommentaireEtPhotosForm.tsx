import { useRef, useState, useEffect } from 'react';
import { useReservation } from '../../../../app/providers/reservationContext/useReservation';
import { useAuth } from '../../../../app/providers/authContext/useAuth';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import styles from './CommentaireEtPhotosForm.module.scss';

const MAX_PHOTOS = 5;

type PhotoEntry = { file: File; preview: string };

export function CommentaireEtPhotosForm() {
    const { setCommentaire, goToStep } = useReservation();
    const { isAuthenticated } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [commentaire, setCommentaireLocal] = useState('');
    const [photos, setPhotos] = useState<PhotoEntry[]>([]);

    // Révoque les object URLs à chaque changement et au démontage — pas de setState
    useEffect(() => {
        return () => photos.forEach((p) => URL.revokeObjectURL(p.preview));
    }, [photos]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        if (selected.length === 0) return;
        // Les URLs sont créées ici, au moment de la mutation — pas dans un effet
        const newEntries = selected.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
        setPhotos((prev) => {
            const combined = [...prev, ...newEntries];
            // Révoque les URLs des entrées exclues si on dépasse MAX_PHOTOS
            combined.slice(MAX_PHOTOS).forEach((e) => URL.revokeObjectURL(e.preview));
            return combined.slice(0, MAX_PHOTOS);
        });
        e.target.value = '';
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleContinue = () => {
        setCommentaire({ commentaire, photos: photos.map((p) => p.file) });
        console.log('[ReservationContext] commentaire :', commentaire, '— photos :', photos.length);
        goToStep(isAuthenticated ? 'confirmation' : 'auth');
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Informations complémentaires <span className={styles.facultatif}>(facultatif)</span></h2>

            <div className={styles.field}>
                <label htmlFor="commentaire" className={styles.label}>
                    Un commentaire pour le technicien ?
                </label>
                <textarea
                    id="commentaire"
                    className={styles.textarea}
                    placeholder="Décrivez l'état de votre vélo, une panne particulière…"
                    value={commentaire}
                    onChange={(e) => setCommentaireLocal(e.target.value)}
                    rows={4}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label}>
                    Photos de votre vélo (max {MAX_PHOTOS})
                </label>

                {photos.length < MAX_PHOTOS && (
                    <div className={styles.uploadActions}>
                        {/* capture="environment" : ouvre l'appareil photo arrière sur mobile */}
                        <button
                            type="button"
                            className={`${styles.uploadBtn} ${styles.cameraBtn}`}
                            onClick={() => cameraInputRef.current?.click()}
                            aria-label="Prendre une photo"
                        >
                            <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            <span className={styles.uploadText}>Prendre une photo</span>
                        </button>
                        <button
                            type="button"
                            className={styles.uploadBtn}
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Choisir depuis la galerie"
                        >
                            <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                <polyline points="21 15 16 10 5 21"/>
                            </svg>
                            <span className={styles.uploadText}>Depuis la galerie</span>
                        </button>
                    </div>
                )}

                {/* Input galerie — multi-sélection sans contrainte de source */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className={styles.hiddenInput}
                    onChange={handleFileChange}
                    aria-hidden="true"
                    tabIndex={-1}
                />
                {/* Input caméra — capture="environment" force l'appareil photo arrière sur mobile */}
                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className={styles.hiddenInput}
                    onChange={handleFileChange}
                    aria-hidden="true"
                    tabIndex={-1}
                />

                {photos.length > 0 && (
                    <div className={styles.previewGrid}>
                        {photos.map((entry, i) => (
                            <div key={entry.preview} className={styles.previewItem}>
                                <img
                                    src={entry.preview}
                                    alt={`Photo ${i + 1}`}
                                    className={styles.previewImg}
                                />
                                <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => handleRemovePhoto(i)}
                                    aria-label={`Supprimer la photo ${i + 1}`}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.actions}>
                <CTAButton onClick={handleContinue}>Continuer</CTAButton>
                <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => goToStep('creneau')}
                >
                    Retour
                </button>
            </div>
        </div>
    );
}
