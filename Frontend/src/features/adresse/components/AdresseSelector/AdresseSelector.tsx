import { useState } from 'react';
import { useAuth } from '../../../../app/providers/authContext/useAuth';
import { useReservation } from '../../../../app/providers/reservationContext/useReservation';
import { useZoneCheck } from '../../../reservation/hooks/useZoneCheck';
import { Card } from '../../../../shared/components/Card/Card';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import { Form } from '../../../../shared/components/Form/Form';
import { useAddressAutocomplete } from '../../hooks/useAddressAutocomplete';
import { useAdresses } from '../../hooks/useAdresses';
import type { Adresse } from '../../types/adresse.types';
import styles from './AdresseSelector.module.scss';

// --- Utilitaires ---

function formatAdresse(a: Adresse): string {
    const parts = [a.numero, a.rue, a.codePostal, a.ville].filter(Boolean);
    return a.titreDescription ?? parts.join(' ');
}

// --- Sous-composant non authentifié ---

function NonAuthSelector() {
    const { setAdresseAndZone, goToStep } = useReservation();
    const { inputRef, decomposedAddress } = useAddressAutocomplete();
    const { checkZone, isLoading, error } = useZoneCheck();

    const handleSubmit = async () => {
        if (!decomposedAddress) return;
        const zone = await checkZone(decomposedAddress.latitude, decomposedAddress.longitude);
        if (!zone) return;
        setAdresseAndZone({ source: 'autocomplete', data: decomposedAddress }, zone);
        goToStep('cycle');
    };

    return (
        <Card className={styles.card}>
            <Form className={styles.form} onSubmit={() => void handleSubmit()}>
                <label className={styles.label} htmlFor="adresse-input">
                    Votre adresse d&apos;intervention
                </label>
                <input
                    id="adresse-input"
                    ref={inputRef}
                    type="text"
                    className={styles.input}
                    placeholder="Ex: 12 rue de la Paix, Lyon"
                    autoComplete="off"
                />
                {error && <p className={styles.error}>{error}</p>}
                <CTAButton
                    type="submit"
                    disabled={!decomposedAddress}
                    isLoading={isLoading}
                >
                    Prendre Rendez-vous
                </CTAButton>
            </Form>
        </Card>
    );
}

// --- Sous-composant authentifié ---

function AuthSelector() {
    const { setAdresseAndZone, goToStep } = useReservation();
    const { adresses } = useAdresses();
    const { inputRef, decomposedAddress } = useAddressAutocomplete();
    const { checkZone, isLoading, error } = useZoneCheck();
    const [selectedId, setSelectedId] = useState<string>('');
    const [showNewInput, setShowNewInput] = useState(false);
    const [adressesSnapshot, setAdressesSnapshot] = useState(adresses);

    const activeAdresses = adresses.filter((a) => a.isValide);

    // Présélectionne l'adresse principale dès que les adresses sont chargées.
    // Ajustement pendant le rendu (pattern React recommandé) plutôt qu'un effect :
    // évite un rendu intermédiaire "vide" suivi d'un second rendu avec la bonne sélection.
    if (adresses !== adressesSnapshot) {
        setAdressesSnapshot(adresses);
        const active = adresses.filter((a) => a.isValide);
        if (active.length > 0) {
            const principal = active.find((a) => a.adressePrincipal);
            setSelectedId(principal?.id ?? active[0].id);
        }
    }

    const handleSubmit = async () => {
        if (showNewInput) {
            // Mode nouvelle adresse : on utilise l'autocomplete
            if (!decomposedAddress) return;
            const zone = await checkZone(decomposedAddress.latitude, decomposedAddress.longitude);
            if (!zone) return;
            setAdresseAndZone({ source: 'autocomplete', data: decomposedAddress }, zone);
        } else {
            // Mode adresse enregistrée
            const adresse = activeAdresses.find((a) => a.id === selectedId);
            if (!adresse) return;
            const zone = await checkZone(adresse.latitude, adresse.longitude);
            if (!zone) return;
            setAdresseAndZone({ source: 'saved', data: adresse }, zone);
        }
        goToStep('cycle');
    };

    const isDisabled = showNewInput ? !decomposedAddress : !selectedId;

    return (
        <Card className={styles.card}>
            <Form className={styles.form} onSubmit={() => void handleSubmit()}>
                <label className={styles.label} htmlFor="adresse-select">
                    Sélectionner une de mes adresses
                </label>

                {!showNewInput ? (
                    <>
                        <select
                            id="adresse-select"
                            className={styles.select}
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            {activeAdresses.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {formatAdresse(a)}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            className={styles.newAddressLink}
                            onClick={() => setShowNewInput(true)}
                        >
                            Saisir une nouvelle adresse
                        </button>
                    </>
                ) : (
                    <>
                        <input
                            id="adresse-select"
                            ref={inputRef}
                            type="text"
                            className={styles.input}
                            placeholder="Ex: 12 rue de la Paix, Lyon"
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className={styles.newAddressLink}
                            onClick={() => setShowNewInput(false)}
                        >
                            ← Choisir une adresse enregistrée
                        </button>
                    </>
                )}

                {error && <p className={styles.error}>{error}</p>}
                <CTAButton
                    type="submit"
                    disabled={isDisabled}
                    isLoading={isLoading}
                >
                    Prendre Rendez-vous
                </CTAButton>
            </Form>
        </Card>
    );
}

// --- Composant public ---

export function AdresseSelector() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <AuthSelector /> : <NonAuthSelector />;
}
