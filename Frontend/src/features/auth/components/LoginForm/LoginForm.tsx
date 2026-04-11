import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import type { LoginPayload } from '../../types/auth.types';
import styles from './LoginForm.module.scss';
import { Card } from '../../../../shared/components/Card/Card';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';

export function LoginForm() {
    const { handleLogin, isLoading, error } = useLogin();
    const [formData, setFormData] = useState<LoginPayload>({
        email: '',
        password: '',
    });

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
                </div>
                <div className={styles.field}>
                    <label htmlFor="password" className={styles.label}>
                        Mot de passe
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={styles.input}
                        placeholder="8 caractères minimum comprenant chiffres"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />
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
