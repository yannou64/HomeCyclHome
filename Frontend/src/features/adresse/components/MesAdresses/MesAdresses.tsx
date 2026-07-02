import { useState, useEffect, type ChangeEvent } from 'react';
import { useAdresses } from '../../hooks/useAdresses';
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import { Form } from '../../../../shared/components/Form/Form';
import type { Adresse } from '../../types/adresse.types';
import styles from './MesAdresses.module.scss';

function formatAdresse(a: Adresse): string {
    const num = a.numero ? `${a.numero} ` : '';
    return `${num}${a.rue}, ${a.codePostal} ${a.ville}`;
}

function chipLabel(a: Adresse): string {
    return a.titreDescription ?? formatAdresse(a);
}

export function MesAdresses() {
    const { adresses, isLoading, error, createAdresse, updateAdresse, deleteAdresse } = useAdresses();
    const { inputRef, decomposedAddress, clearAddress } = useAddressAutocomplete();

    // null = rien sélectionné, 'new' = création, string = id (PeutSeSituer.id) sélectionné
    const [selectedId, setSelectedId] = useState<string | 'new' | null>(null);
    const [titreDescription, setTitreDescription] = useState('');
    const [adressePrincipal, setAdressePrincipal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    // Pré-remplissage du formulaire à la sélection d'une adresse existante
    useEffect(() => {
        if (selectedId === 'new') {
            setTitreDescription('');
            setAdressePrincipal(adresses.length === 0);
            clearAddress();
        } else if (selectedId) {
            const adresse = adresses.find((a) => a.id === selectedId);
            if (adresse) {
                setTitreDescription(adresse.titreDescription ?? '');
                setAdressePrincipal(adresse.adressePrincipal);
            }
        }
        setFormError(null);
        setFormSuccess(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId, adresses]);

    async function handleCreate() {
        if (!decomposedAddress) {
            setFormError('Veuillez sélectionner une adresse dans la liste de suggestions.');
            return;
        }

        setFormError(null);
        setFormSuccess(null);
        setIsSaving(true);

        try {
            await createAdresse({
                ...decomposedAddress,
                titreDescription: titreDescription || undefined,
                adressePrincipal,
            });
            setSelectedId(null);
            setFormSuccess('Adresse ajoutée !');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setFormError(msg ?? 'Une erreur est survenue. Veuillez réessayer.');
        } finally {
            setIsSaving(false);
        }
    }

    async function handleUpdate() {
        if (!selectedId || selectedId === 'new') return;

        setFormError(null);
        setFormSuccess(null);
        setIsSaving(true);

        try {
            await updateAdresse(selectedId, {
                titreDescription: titreDescription || undefined,
                adressePrincipal,
            });
            setSelectedId(null);
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
            await deleteAdresse(selectedId);
            setSelectedId(null);
        } catch {
            setFormError('Impossible de désactiver cette adresse.');
        } finally {
            setIsSaving(false);
        }
    }

    const isNew = selectedId === 'new';
    const selectedAdresse = adresses.find((a) => a.id === selectedId);

    if (isLoading) return <p className={styles.loading}>Chargement de vos adresses…</p>;
    if (error) return <p className={styles.error}>{error}</p>;

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.title}>Mes Adresses</h2>

            {/* Sélecteur — chips + bouton + */}
            <div className={styles.chipRow}>
                {adresses.map((adresse) => (
                    <button
                        key={adresse.id}
                        type="button"
                        className={[
                            styles.chip,
                            selectedId === adresse.id ? styles.chipActive : '',
                            adresse.adressePrincipal && selectedId !== adresse.id
                                ? styles.chipPrincipal
                                : '',
                        ].join(' ')}
                        onClick={() => setSelectedId(adresse.id)}
                    >
                        {chipLabel(adresse)}
                    </button>
                ))}
                <button
                    type="button"
                    className={`${styles.chip} ${isNew ? styles.chipActive : ''}`}
                    onClick={() => setSelectedId('new')}
                    aria-label="Ajouter une adresse"
                >
                    +
                </button>
            </div>

            {/* Formulaire de création */}
            {isNew && (
                <Form className={styles.form} onSubmit={() => void handleCreate()}>
                    <div className={styles.field}>
                        <label htmlFor="autocomplete" className={styles.label}>
                            Adresse
                        </label>
                        <input
                            id="autocomplete"
                            ref={inputRef}
                            type="text"
                            className={styles.input}
                            placeholder="Ex : 12 rue de la Paix, Lyon"
                            autoComplete="off"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="titreDescriptionNew" className={styles.label}>
                            Label (optionnel)
                        </label>
                        <input
                            id="titreDescriptionNew"
                            type="text"
                            className={styles.input}
                            value={titreDescription}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setTitreDescription(e.target.value)
                            }
                            placeholder="Ex : Domicile, Bureau…"
                        />
                    </div>

                    {adresses.length > 0 && (
                        <div className={styles.toggleRow}>
                            <span className={styles.toggleLabel}>Adresse principale</span>
                            <label className={styles.toggleWrapper}>
                                <input
                                    type="checkbox"
                                    checked={adressePrincipal}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        setAdressePrincipal(e.target.checked)
                                    }
                                />
                                <span
                                    className={`${styles.toggleSlider} ${adressePrincipal ? styles.toggleSliderActive : ''}`}
                                />
                            </label>
                        </div>
                    )}

                    {formError && <p className={styles.error}>{formError}</p>}
                    {formSuccess && <p className={styles.success}>{formSuccess}</p>}

                    <CTAButton type="submit" isLoading={isSaving} disabled={!decomposedAddress}>
                        Enregistrer
                    </CTAButton>
                </Form>
            )}

            {/* Formulaire d'édition */}
            {selectedId && !isNew && selectedAdresse && (
                <Form className={styles.form} onSubmit={() => void handleUpdate()}>
                    {/* Adresse physique — lecture seule */}
                    <div className={styles.field}>
                        <span className={styles.label}>Adresse</span>
                        <p className={styles.addressReadonly}>{formatAdresse(selectedAdresse)}</p>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="titreDescriptionEdit" className={styles.label}>
                            Label (optionnel)
                        </label>
                        <input
                            id="titreDescriptionEdit"
                            type="text"
                            className={styles.input}
                            value={titreDescription}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setTitreDescription(e.target.value)
                            }
                            placeholder="Ex : Domicile, Bureau…"
                        />
                    </div>

                    {/* Toggle adresse principale */}
                    <div className={styles.toggleRow}>
                        <span className={styles.toggleLabel}>Adresse principale</span>
                        <label className={styles.toggleWrapper}>
                            <input
                                type="checkbox"
                                checked={adressePrincipal}
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    setAdressePrincipal(e.target.checked)
                                }
                            />
                            <span
                                className={`${styles.toggleSlider} ${adressePrincipal ? styles.toggleSliderActive : ''}`}
                            />
                        </label>
                    </div>

                    {formError && <p className={styles.error}>{formError}</p>}
                    {formSuccess && <p className={styles.success}>{formSuccess}</p>}

                    <CTAButton type="submit" isLoading={isSaving}>
                        Modifier
                    </CTAButton>

                    {adresses.length > 1 && (
                        <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => void handleDelete()}
                            disabled={isSaving}
                        >
                            Désactiver
                        </button>
                    )}
                </Form>
            )}
        </div>
    );
}
