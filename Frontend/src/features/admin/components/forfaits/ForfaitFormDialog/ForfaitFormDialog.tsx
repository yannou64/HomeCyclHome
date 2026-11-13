import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../../../../shared/components/ui/dialog';
import type { Forfait, ForfaitPayload } from '../../../types/forfaits.types';
import styles from './ForfaitFormDialog.module.scss';

interface ForfaitFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: ForfaitPayload) => Promise<void>;
    item?: Forfait;
}

const DEFAULT_FORM = {
    nom: '',
    description: '',
    dureeMinutes: 60,
    isActif: true,
};

export function ForfaitFormDialog({
    isOpen,
    onClose,
    onSubmit,
    item,
}: ForfaitFormDialogProps) {
    const isEditing = !!item;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={styles.content}>
                <DialogHeader>
                    <DialogTitle className={styles.title}>
                        {isEditing ? 'Modifier le forfait' : 'Nouveau forfait'}
                    </DialogTitle>
                </DialogHeader>
                {/* Monté à chaque ouverture, démonté à la fermeture : l'état du
            formulaire repart toujours de l'élément à modifier. */}
                <ForfaitForm
                    item={item}
                    onSubmit={onSubmit}
                    onClose={onClose}
                />
            </DialogContent>
        </Dialog>
    );
}

interface ForfaitFormProps {
    item?: Forfait;
    onSubmit: (payload: ForfaitPayload) => Promise<void>;
    onClose: () => void;
}

// Valeurs de départ du formulaire : celles du forfait en modification, ou
// les valeurs par défaut pour une création.
function formFromItem(item?: Forfait) {
    if (!item) return DEFAULT_FORM;
    return {
        nom: item.nom,
        description: item.description ?? '',
        dureeMinutes: item.dureeMinutes,
        isActif: item.isActif,
    };
}

// Contenu du dialogue. Il est rendu à l'intérieur de <DialogContent>, que
// Radix démonte à la fermeture : chaque ouverture crée donc un nouvel état,
// initialisé directement par useState, sans effet de recopie.
function ForfaitForm({ item, onSubmit, onClose }: ForfaitFormProps) {
    const isEditing = !!item;
    // Fonction d'initialisation : exécutée une seule fois, au montage.
    const [form, setForm] = useState(() => formFromItem(item));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await onSubmit({
                nom: form.nom,
                description: form.description || undefined,
                dureeMinutes: form.dureeMinutes,
                isActif: form.isActif,
            });
            onClose();
        } catch {
            setError('Ce nom existe déjà ou une erreur est survenue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
                <label className={styles.label} htmlFor="nom">
                    Nom
                </label>
                <input
                    id="nom"
                    type="text"
                    className={styles.input}
                    value={form.nom}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, nom: e.target.value }))
                    }
                    required
                    autoFocus
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="description">
                    Description{' '}
                    <span className={styles.optional}>(optionnel)</span>
                </label>
                <textarea
                    id="description"
                    className={styles.textarea}
                    value={form.description}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={3}
                />
            </div>

            <div className={styles.field}>
                <label className={styles.label} htmlFor="dureeMinutes">
                    Durée (minutes)
                </label>
                <input
                    id="dureeMinutes"
                    type="number"
                    className={styles.input}
                    value={form.dureeMinutes}
                    onChange={(e) =>
                        setForm((f) => ({
                            ...f,
                            dureeMinutes: Number(e.target.value),
                        }))
                    }
                    min={15}
                    required
                />
            </div>

            <div className={styles.checkboxField}>
                <input
                    id="isActif"
                    type="checkbox"
                    className={styles.checkbox}
                    checked={form.isActif}
                    onChange={(e) =>
                        setForm((f) => ({ ...f, isActif: e.target.checked }))
                    }
                />
                <label className={styles.checkboxLabel} htmlFor="isActif">
                    Forfait actif
                </label>
            </div>

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
                    {isSubmitting
                        ? 'En cours...'
                        : isEditing
                          ? 'Enregistrer'
                          : 'Créer'}
                </button>
            </div>
        </form>
    );
}
