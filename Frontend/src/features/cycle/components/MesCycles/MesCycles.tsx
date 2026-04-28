import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useCycles } from '../../hooks/useCycles';
import { useReferentiel } from '../../hooks/useReferentiel';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import type { Cycle } from '../../types/cycle.types';
import styles from './MesCycles.module.scss';

type FormState = {
    libelle: string;
    marqueId: string;
    typeCycleId: string;
    particularite: string;
};

const EMPTY_FORM: FormState = {
    libelle: '',
    marqueId: '',
    typeCycleId: '',
    particularite: '',
};

function cycleToForm(cycle: Cycle): FormState {
    return {
        libelle: cycle.libelle,
        marqueId: cycle.marque.id,
        typeCycleId: cycle.typeCycle.id,
        particularite: cycle.particularite ?? '',
    };
}

export function MesCycles() {
    const { cycles, isLoading, error, createCycle, updateCycle, deleteCycle } = useCycles();
    const { marques, typesCycles, isLoading: refLoading } = useReferentiel();

    // null = rien sélectionné, 'new' = création, string = id du cycle sélectionné
    const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // Quand on sélectionne un cycle existant, on pré-remplit le formulaire
    useEffect(() => {
        if (selectedId === 'new') {
            setForm(EMPTY_FORM);
        } else if (selectedId) {
            const cycle = cycles.find((c) => c.id === selectedId);
            if (cycle) setForm(cycleToForm(cycle));
        }
        setFormError(null);
        setFormSuccess(null);
    }, [selectedId, cycles]);

    function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);
        setIsSaving(true);

        const payload = {
            libelle: form.libelle,
            marqueId: form.marqueId,
            typeCycleId: form.typeCycleId,
            particularite: form.particularite || undefined,
        };

        try {
            if (selectedId === 'new') {
                await createCycle(payload);
                setForm(EMPTY_FORM);
                setSelectedId(null);
                setFormSuccess('Cycle ajouté !');
            } else if (selectedId) {
                await updateCycle(selectedId, payload);
                setFormSuccess('Cycle mis à jour !');
            }
        } catch {
            setFormError('Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete() {
        if (!selectedId || selectedId === 'new') return;
        setIsSaving(true);
        try {
            await deleteCycle(selectedId);
            setSelectedId(null);
        } catch {
            setFormError('Impossible de supprimer ce cycle.');
        } finally {
            setIsSaving(false);
        }
    }

    const isNew = selectedId === 'new';

    if (isLoading) return <p className={styles.loading}>Chargement de vos cycles…</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Mes Cycles</h2>

            {/* Sélecteur de cycles */}
            <div className={styles.chipRow}>
                {cycles.map((cycle) => (
                    <button
                        key={cycle.id}
                        type="button"
                        className={`${styles.chip} ${selectedId === cycle.id ? styles.chipActive : ''}`}
                        onClick={() => setSelectedId(cycle.id)}
                    >
                        {cycle.libelle}
                    </button>
                ))}
                <button
                    type="button"
                    className={`${styles.chip} ${isNew ? styles.chipActive : ''}`}
                    onClick={() => setSelectedId('new')}
                    aria-label="Ajouter un cycle"
                >
                    +
                </button>
            </div>

            {/* Formulaire — affiché uniquement si un cycle est sélectionné ou en création */}
            {selectedId !== null && (
                <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>

                    <div className={styles.field}>
                        <label htmlFor="libelle" className={styles.label}>Libellé</label>
                        <input
                            id="libelle"
                            name="libelle"
                            type="text"
                            className={styles.input}
                            value={form.libelle}
                            onChange={handleChange}
                            placeholder="Ex : Mon VTT de trail"
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="marqueId" className={styles.label}>Marque</label>
                        <select
                            id="marqueId"
                            name="marqueId"
                            className={styles.select}
                            value={form.marqueId}
                            onChange={handleChange}
                            required
                            disabled={refLoading}
                        >
                            <option value="">Sélectionner une marque</option>
                            {marques.map((m) => (
                                <option key={m.id} value={m.id}>{m.libelle}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="typeCycleId" className={styles.label}>Type de cycle</label>
                        <select
                            id="typeCycleId"
                            name="typeCycleId"
                            className={styles.select}
                            value={form.typeCycleId}
                            onChange={handleChange}
                            required
                            disabled={refLoading}
                        >
                            <option value="">Sélectionner un type</option>
                            {typesCycles.map((t) => (
                                <option key={t.id} value={t.id}>{t.libelle}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="particularite" className={styles.label}>Particularités</label>
                        <textarea
                            id="particularite"
                            name="particularite"
                            className={styles.textarea}
                            value={form.particularite}
                            onChange={handleChange}
                            placeholder="Ex : Roues 29 pouces, freins hydrauliques…"
                            rows={4}
                        />
                    </div>

                    {formError && <p className={styles.error}>{formError}</p>}
                    {formSuccess && <p className={styles.success}>{formSuccess}</p>}

                    <CTAButton type="submit" isLoading={isSaving}>
                        {isNew ? 'Enregistrer' : 'Modifier'}
                    </CTAButton>

                    {!isNew && (
                        <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => void handleDelete()}
                            disabled={isSaving}
                        >
                            Supprimer
                        </button>
                    )}
                </form>
            )}
        </div>
    );
}
