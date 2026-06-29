import { useEffect, useState } from 'react';
import { useAuth } from '../../../../app/providers/authContext/useAuth';
import { useReservation } from '../../../../app/providers/reservationContext/useReservation';
import { reservationService } from '../../../reservation/services/reservationService';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
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
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!decomposedAddress) return;
        setIsLoading(true);
        setError(null);
        try {
            const zone = await reservationService.checkZone(
                decomposedAddress.latitude,
                decomposedAddress.longitude,
            );
            setAdresseAndZone({ source: 'autocomplete', data: decomposedAddress }, zone);
            goToStep('cycle');
        } catch {
            setError(
                "Votre adresse n'est pas encore couverte par nos zones d'intervention.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
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
                onClick={() => void handleSubmit()}
                disabled={!decomposedAddress}
                isLoading={isLoading}
            >
                Prendre Rendez-vous
            </CTAButton>
        </div>
    );
}

// --- Sous-composant authentifié ---

function AuthSelector() {
    const { setAdresseAndZone, goToStep } = useReservation();
    const { adresses } = useAdresses();
    const { inputRef, decomposedAddress } = useAddressAutocomplete();
    const [selectedId, setSelectedId] = useState<string>('');
    const [showNewInput, setShowNewInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeAdresses = adresses.filter((a) => a.isValide);

    // Présélectionne l'adresse principale dès que les adresses sont chargées
    useEffect(() => {
        const active = adresses.filter((a) => a.isValide);
        if (active.length === 0) return;
        const principal = active.find((a) => a.adressePrincipal);
        setSelectedId(principal?.id ?? active[0].id);
    }, [adresses]);

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            if (showNewInput) {
                // Mode nouvelle adresse : on utilise l'autocomplete
                if (!decomposedAddress) return;
                const zone = await reservationService.checkZone(
                    decomposedAddress.latitude,
                    decomposedAddress.longitude,
                );
                setAdresseAndZone({ source: 'autocomplete', data: decomposedAddress }, zone);
            } else {
                // Mode adresse enregistrée
                const adresse = activeAdresses.find((a) => a.id === selectedId);
                if (!adresse) return;
                const zone = await reservationService.checkZone(
                    adresse.latitude,
                    adresse.longitude,
                );
                setAdresseAndZone({ source: 'saved', data: adresse }, zone);
            }
            goToStep('cycle');
        } catch {
            setError(
                "Votre adresse n'est pas encore couverte par nos zones d'intervention.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isDisabled = showNewInput ? !decomposedAddress : !selectedId;

    return (
        <div className={styles.wrapper}>
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
                onClick={() => void handleSubmit()}
                disabled={isDisabled}
                isLoading={isLoading}
            >
                Prendre Rendez-vous
            </CTAButton>
        </div>
    );
}

// --- Composant public ---

export function AdresseSelector() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <AuthSelector /> : <NonAuthSelector />;
}
