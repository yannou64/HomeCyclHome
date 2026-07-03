import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';
import type { RegisterPayload } from '../../types/auth.types';
import styles from './RegisterForm.module.scss';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import { Form } from '../../../../shared/components/Form/Form';
import emailIcon from '../../../../assets/icones/email.svg';
import phoneIcon from '../../../../assets/icones/telephone.svg';
import eyeOpenIcon from '../../../../assets/icones/oeilOuvert.svg';
import eyeClosedIcon from '../../../../assets/icones/oeilFerme.svg';

export function RegisterForm() {
    const { handleRegister, isLoading, error, isSuccess } = useRegister();
    const [formData, setFormData] = useState<RegisterPayload>({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        password: '',
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptCgu, setAcceptCgu] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit() {
        setFormError(null);

        if (formData.password !== confirmPassword) {
            setFormError('Les mots de passe ne correspondent pas.');
            return;
        }
        if (!acceptCgu) {
            setFormError('Tu dois accepter les CGU pour continuer.');
            return;
        }

        handleRegister(formData);
    }

    const canSubmit =
        !!formData.prenom &&
        !!formData.nom &&
        !!formData.email &&
        !!formData.telephone &&
        !!formData.password &&
        !!confirmPassword &&
        acceptCgu;

    if (isSuccess) {
        return (
            <p className={styles.successMessage}>
                Inscription réussie ! Vérifie ta boîte mail pour confirmer ton
                compte.
            </p>
        );
    }

    return (
        <>
            <h2 className={styles.title}>Créer un compte</h2>
            <Form className={styles.form} onSubmit={handleSubmit}>

                {/* Prénom + Nom en deux colonnes */}
                <div className={styles.nameRow}>
                    <div className={styles.field}>
                        <label htmlFor="prenom" className={styles.label}>Prénom</label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="prenom" name="prenom" type="text"
                                className={styles.input} placeholder="Ex: Yannick"
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
                                className={styles.input} placeholder="Ex: Biot"
                                value={formData.nom} onChange={handleChange}
                                autoComplete="family-name"
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="email" name="email" type="email"
                            className={styles.input} placeholder="Ex: nomPrenom@gmail.com"
                            value={formData.email} onChange={handleChange}
                            autoComplete="email"
                        />
                        <img src={emailIcon} alt="" className={styles.inputIcon} aria-hidden="true" />
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="telephone" className={styles.label}>Téléphone</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="telephone" name="telephone" type="tel"
                            className={styles.input} placeholder="Ex: 06 12 34 56 78"
                            value={formData.telephone} onChange={handleChange}
                            autoComplete="tel"
                        />
                        <img src={phoneIcon} alt="" className={styles.inputIcon} aria-hidden="true" />
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>Mot de passe</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="password" name="password"
                            type={showPassword ? 'text' : 'password'}
                            className={styles.input} placeholder="8 caractères minimum comprenant chiffres"
                            value={formData.password} onChange={handleChange}
                            autoComplete="new-password"
                        />
                        <button
                            type="button" className={styles.eyeButton}
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                            <img src={showPassword ? eyeOpenIcon : eyeClosedIcon} alt="" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="confirmPassword" className={styles.label}>Confirmer Mot de passe</label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="confirmPassword" name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            className={styles.input} placeholder="8 caractères minimum comprenant chiffres"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                        <button
                            type="button" className={styles.eyeButton}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                            <img src={showConfirmPassword ? eyeOpenIcon : eyeClosedIcon} alt="" aria-hidden="true" />
                        </button>
                    </div>
                </div>

                <label className={styles.checkboxField}>
                    <input
                        type="checkbox"
                        checked={acceptCgu}
                        onChange={(e) => setAcceptCgu(e.target.checked)}
                        className={styles.checkbox}
                    />
                    <span className={styles.checkboxLabel}>J'accepte les CGU</span>
                </label>

                {(formError ?? error) && (
                    <p className={styles.error}>{formError ?? error}</p>
                )}

                <CTAButton type="submit" disabled={!canSubmit} isLoading={isLoading}>S'inscrire</CTAButton>
            </Form>
            <p className={styles.loginLink}>
                Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
        </>
    );
}
