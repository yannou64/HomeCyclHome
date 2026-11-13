import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { AdminUser, CreateUserPayload, UpdateUserPayload } from '../../../types/admin.types';
import styles from './UserFormDialog.module.scss';

interface UserFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
    // Si user est fourni → mode édition, sinon → mode création
    user?: AdminUser;
}

type FormState = {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: AdminUser['role'];
    password: string;
};

const EMPTY_FORM: FormState = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'client',
    password: '',
};

export function UserFormDialog({ isOpen, onClose, onSubmit, user }: UserFormDialogProps) {
    const isEditing = !!user;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={styles.content}>
                <DialogHeader>
                    <DialogTitle className={styles.title}>
                        {isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                    </DialogTitle>
                </DialogHeader>

                {/* Monté à chaque ouverture, démonté à la fermeture : l'état du
                    formulaire repart toujours de l'utilisateur à modifier. */}
                <UserForm user={user} onSubmit={onSubmit} onClose={onClose} />
            </DialogContent>
        </Dialog>
    );
}

// Valeurs de départ : celles de l'utilisateur modifié (mot de passe vide),
// ou un formulaire vide pour une création.
function formFromUser(user?: AdminUser): FormState {
    if (!user) return EMPTY_FORM;
    return {
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        password: '',
    };
}

interface UserFormProps {
    user?: AdminUser;
    onSubmit: (data: CreateUserPayload | UpdateUserPayload) => Promise<void>;
    onClose: () => void;
}

// Contenu du dialogue. Rendu à l'intérieur de <DialogContent>, que Radix
// démonte à la fermeture : chaque ouverture crée un nouvel état, initialisé
// directement par useState, sans effet de recopie.
function UserForm({ user, onSubmit, onClose }: UserFormProps) {
    const isEditing = !!user;
    // Fonction d'initialisation : exécutée une seule fois, au montage.
    const [form, setForm] = useState<FormState>(() => formFromUser(user));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            if (isEditing) {
                // En édition, on n'envoie pas le mot de passe (champ ignoré)
                const { nom, prenom, email, telephone, role } = form;
                await onSubmit({ nom, prenom, email, telephone, role } as UpdateUserPayload);
            } else {
                await onSubmit(form as CreateUserPayload);
            }
            onClose();
        } catch {
            setError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.row}>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="prenom">Prénom</label>
                    <input
                        id="prenom"
                        name="prenom"
                        type="text"
                        className={styles.input}
                        value={form.prenom}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="nom">Nom</label>
                    <input
                        id="nom"
                        name="nom"
                        type="text"
                        className={styles.input}
                        value={form.nom}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    className={styles.input}
                    value={form.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="telephone">Téléphone</label>
                <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    className={styles.input}
                    placeholder="0601020304"
                    value={form.telephone}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="role">Rôle</label>
                <select
                    id="role"
                    name="role"
                    className={styles.input}
                    value={form.role}
                    onChange={handleChange}
                >
                    <option value="client">Client</option>
                    <option value="technicien">Technicien</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Mot de passe uniquement en création */}
            {!isEditing && (
                <div className={styles.field}>
                    <label className={styles.label} htmlFor="password">Mot de passe</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className={styles.input}
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                    />
                </div>
            )}

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'En cours...' : isEditing ? 'Enregistrer' : 'Créer'}
                </button>
            </div>
        </form>
    );
}
