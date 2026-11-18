import { useState } from 'react';
import { useCreerModele } from '../../../hooks/useCreerModele';
import type { BlocHoraire, JourSemaine } from '../../../types/planning.types';
import { erreurSaisieModele } from '../../../utils/blocsHoraires';
import {
    GRIS_ZONE_INACTIVE,
    hexDeCouleur,
} from '../../../../../shared/utils/couleursZones';
import { PastilleCouleur } from '../../zones/PastilleCouleur/PastilleCouleur';
import { BlocsHorairesEditeur } from '../BlocsHorairesEditeur/BlocsHorairesEditeur';
import { FriseJournee } from '../FriseJournee/FriseJournee';
import { JoursSemaineChoix } from '../JoursSemaineChoix/JoursSemaineChoix';
import styles from './ModeleCreationForm.module.scss';

interface ModeleCreationFormProps {
    technicienId: string;
    onCree: () => void; // retour à la liste des modèles, rechargée
    onRetour: () => void;
}

/**
 * Formulaire « Créer un nouveau modèle », version desktop en deux colonnes
 * (choix de Yannick du 18/11/2026) : à gauche, dans l'ordre des questions
 * (quoi, où, quand) ; à droite, la journée type dessinée de 7h à 20h.
 * Pas de période : un modèle n'en a pas (RG3 d'« Administrer les modèles »).
 */
export function ModeleCreationForm({
    technicienId,
    onCree,
    onRetour,
}: ModeleCreationFormProps) {
    const { zones, zonesError, creer, isSubmitting, error, setError } =
        useCreerModele(technicienId);
    const [intitule, setIntitule] = useState('');
    const [zoneId, setZoneId] = useState('');
    const [jours, setJours] = useState<JourSemaine[]>([]);
    const [blocs, setBlocs] = useState<BlocHoraire[]>([]);

    const zone = zones.find((z) => z.id === zoneId);
    const couleur = zone ? hexDeCouleur(zone.couleur) : GRIS_ZONE_INACTIVE;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const manque = erreurSaisieModele({ intitule, zoneId, jours, blocs });
        if (manque) {
            setError(manque);
            return;
        }
        const ok = await creer({
            intitule: intitule.trim(),
            zoneId,
            jours,
            blocs,
        });
        if (ok) onCree();
    };

    return (
        <form onSubmit={handleSubmit} className={styles.wrapper}>
            <button type="button" className={styles.retour} onClick={onRetour}>
                ← Retour
            </button>
            <h2 className={styles.titre}>Nouveau modèle</h2>

            <div className={styles.colonnes}>
                <div className={styles.formulaire}>
                    <label className={styles.champ}>
                        <span className={styles.label}>Titre</span>
                        <input
                            className={styles.input}
                            value={intitule}
                            maxLength={100}
                            placeholder="Ex : Semaine matin"
                            onChange={(e) => setIntitule(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </label>

                    <label className={styles.champ}>
                        <span className={styles.label}>Zone</span>
                        <span className={styles.zone}>
                            <PastilleCouleur hex={couleur} />
                            <select
                                className={styles.input}
                                value={zoneId}
                                onChange={(e) => setZoneId(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="">Choisir une zone</option>
                                {zones.map((z) => (
                                    <option key={z.id} value={z.id}>
                                        {z.nomZone}
                                    </option>
                                ))}
                            </select>
                        </span>
                        {zonesError && (
                            <p className={styles.error}>{zonesError}</p>
                        )}
                    </label>

                    <JoursSemaineChoix
                        valeur={jours}
                        onChange={setJours}
                        disabled={isSubmitting}
                    />
                    <BlocsHorairesEditeur
                        valeur={blocs}
                        onChange={setBlocs}
                        disabled={isSubmitting}
                    />
                </div>

                <aside
                    className={styles.apercu}
                    aria-label="Aperçu de la journée type"
                >
                    <p className={styles.label}>Journée type</p>
                    <FriseJournee blocs={blocs} couleur={couleur} />
                </aside>
            </div>

            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.boutonSecondaire}
                    onClick={onRetour}
                    disabled={isSubmitting}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className={styles.boutonPrincipal}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Création…' : 'Créer le modèle'}
                </button>
            </div>
        </form>
    );
}
