import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import type { LoginPayload } from '../../types/auth.types';
import styles from './LoginForm.module.scss';
import { Card } from '../../../../shared/components/Card/Card';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import emailIcon from '../../../../assets/icones/email.svg';
import eyeOpenIcon from '../../../../assets/icones/oeilOuvert.svg';
import eyeClosedIcon from '../../../../assets/icones/oeilFerme.svg';

export function LoginForm() {
    const { handleLogin, isLoading, error } = useLogin();
    const [formData, setFormData] = useState<LoginPayload>({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleLogin(formData);
    }

    return (
        <Card>
            <h2 className={styles.title}>Se Connecter</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={styles.input}
                            placeholder="Ex: nomPrenom@gmail.com"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                        />
                        <img src={emailIcon} alt="" className={styles.inputIcon} aria-hidden="true" />
                    </div>
                </div>
                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>
                        Mot de passe
                    </label>
                    <div className={styles.inputWrapper}>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            className={styles.input}
                            placeholder="8 caractères minimum comprenant chiffres"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className={styles.eyeButton}
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                            <img src={showPassword ? eyeOpenIcon : eyeClosedIcon} alt="" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                {error && <p className={styles.error}>{error}</p>}
                <CTAButton type="submit" isLoading={isLoading}>Connexion</CTAButton>
            </form>
            <p className={styles.registerLink}>
                Pas de compte ? <Link to="/inscription">S'inscrire</Link>
            </p>
        </Card>
    );
}
