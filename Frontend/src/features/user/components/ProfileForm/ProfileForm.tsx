import { useState, type ChangeEvent } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import phoneIcon from '../../../../assets/icones/telephone.svg';
import type { UserProfile } from '../../types/user.types';
import styles from './ProfileForm.module.scss';

// Reçoit un profil garanti non-null — initialise l'état directement depuis la prop
function ProfileFormFields({ initialProfile }: { initialProfile: UserProfile }) {
    const { handleUpdateProfile, isLoading, error, isSuccess } = useUpdateProfile();

    const [formData, setFormData] = useState({
        nom: initialProfile.nom,
        prenom: initialProfile.prenom,
        telephone: initialProfile.telephone,
    });

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: { preventDefault(): void }) {
        e.preventDefault();
        void handleUpdateProfile(formData);
    }

    return (
        <>
            <h2 className={styles.title}>Mon profil</h2>
            <form className={styles.form} onSubmit={handleSubmit}>

                <div className={styles.nameRow}>
                    <div className={styles.field}>
                        <label htmlFor="prenom" className={styles.label}>Prénom</label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="prenom" name="prenom" type="text"
                                className={styles.input}
                                value={formData.prenom} onChange={handleChange}
                                autoComplete="given-name"
                            />
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="nom" className={styles.label}>Nom</label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="nom" name="nom" type="text"
                                className={styles.input}
                                value={formData.nom} onChange={handleChange}
                                autoComplete="family-name"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="telephone" className={styles.label}>Téléphone</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="telephone" name="telephone" type="tel"
                            className={styles.input}
                            value={formData.telephone} onChange={handleChange}
                            autoComplete="tel"
                        />
                        <img src={phoneIcon} alt="" className={styles.inputIcon} aria-hidden="true" />
                    </div>
                </div>

                {error && <p className={styles.error}>{error}</p>}
                {isSuccess && <p className={styles.success}>Profil mis à jour !</p>}

                <CTAButton type="submit" isLoading={isLoading}>
                    Enregistrer
                </CTAButton>
            </form>
        </>
    );
}

// Gère le cycle de chargement — ne rend le formulaire que quand profile est disponible
export function ProfileForm() {
    const { profile, isLoading, error } = useProfile();

    if (isLoading) {
        return <p className={styles.loading}>Chargement du profil…</p>;
    }

    if (error) {
        return <p className={styles.error}>{error}</p>;
    }

    if (!profile) return null;

    return <ProfileFormFields initialProfile={profile} />;
}
