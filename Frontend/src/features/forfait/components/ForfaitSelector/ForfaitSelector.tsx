import { useState } from 'react';
import type { ForfaitInfo } from '../../../../app/providers/reservationContext/types/reservation.types';
import type { ForfaitDto } from '../../../reservation/types/forfait.types';
import styles from './ForfaitSelector.module.scss';

interface IForfaitSelectorProps {
    forfaits: ForfaitDto[];
    onChange: (forfait: ForfaitInfo | null) => void;
}

function formatDuree(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
}

function formatPrix(prix: number | null): string {
    if (prix === null) return '—';
    return `${prix.toFixed(2)} €`;
}

export function ForfaitSelector({ forfaits, onChange }: IForfaitSelectorProps) {
    const [selectedId, setSelectedId] = useState<string>('');

    const handleSelect = (forfait: ForfaitDto) => {
        setSelectedId(forfait.id);
        onChange({
            forfaitId: forfait.id,
            nom: forfait.nom,
            dureeMinutes: forfait.duree_minutes,
            prix: forfait.prix_actif,
        });
    };

    return (
        <div className={styles.cardsList}>
            {forfaits.map((f) => (
                <label
                    key={f.id}
                    className={`${styles.card} ${selectedId === f.id ? styles.selected : ''}`}
                    htmlFor={`forfait-${f.id}`}
                >
                    <input
                        type="radio"
                        name="forfait"
                        id={`forfait-${f.id}`}
                        value={f.id}
                        className={styles.radio}
                        checked={selectedId === f.id}
                        onChange={() => handleSelect(f)}
                    />
                    <span className={styles.radioIndicator} aria-hidden="true" />
                    <div className={styles.cardContent}>
                        <p className={styles.cardNom}>{f.nom}</p>
                        {f.description && (
                            <p className={styles.cardDescription}>{f.description}</p>
                        )}
                        <div className={styles.cardMeta}>
                            <span>{formatDuree(f.duree_minutes)}</span>
                            <span>{formatPrix(f.prix_actif)}</span>
                        </div>
                    </div>
                </label>
            ))}
        </div>
    );
}
