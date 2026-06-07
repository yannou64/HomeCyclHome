import { useEffect, useState } from 'react';
import type { CycleBooking } from '../../../../app/providers/reservationContext/types/reservation.types';
import type { Cycle, Marque, TypeCycle } from '../../types/cycle.types';
import styles from './CycleSelector.module.scss';

const NEW_CYCLE_VALUE = '__new__';

interface ICycleSelectorProps {
    typesCycles: TypeCycle[];
    marques: Marque[];
    // undefined = utilisateur non authentifié
    userCycles?: Cycle[];
    onChange: (cycle: CycleBooking | null) => void;
}

export function CycleSelector({
    typesCycles,
    marques,
    userCycles,
    onChange,
}: ICycleSelectorProps) {
    const hasCycles = userCycles !== undefined && userCycles.length > 0;

    // Pré-sélectionne le premier cycle si l'utilisateur en a
    const [selectedCycleId, setSelectedCycleId] = useState(
        hasCycles ? userCycles![0].id : NEW_CYCLE_VALUE,
    );
    const [typeCycleId, setTypeCycleId] = useState('');
    const [marqueId, setMarqueId] = useState('');

    // Notifie le parent de la pré-sélection initiale
    useEffect(() => {
        if (!hasCycles) return;
        const first = userCycles![0];
        onChange({
            source: 'existing',
            cycleId: first.id,
            typeCycleId: first.typeCycle.id,
            typeCycleLibelle: first.typeCycle.libelle,
            marqueId: first.marque.id,
            marqueLibelle: first.marque.libelle,
        });
        // onChange est stable (useState setter du parent) — on ne court qu'au montage
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Affiche les selects type+marque si non connecté OU si "Nouveau vélo" sélectionné
    const showNewFields = !hasCycles || selectedCycleId === NEW_CYCLE_VALUE;

    const handleExistingSelect = (cycleId: string) => {
        setSelectedCycleId(cycleId);
        if (cycleId === NEW_CYCLE_VALUE) {
            onChange(null);
            return;
        }
        const cycle = userCycles!.find((c) => c.id === cycleId);
        if (!cycle) return;
        onChange({
            source: 'existing',
            cycleId: cycle.id,
            typeCycleId: cycle.typeCycle.id,
            typeCycleLibelle: cycle.typeCycle.libelle,
            marqueId: cycle.marque.id,
            marqueLibelle: cycle.marque.libelle,
        });
    };

    const handleNewFieldChange = (field: 'type' | 'marque', value: string) => {
        const newTypeCycleId = field === 'type' ? value : typeCycleId;
        const newMarqueId = field === 'marque' ? value : marqueId;

        if (field === 'type') setTypeCycleId(value);
        else setMarqueId(value);

        if (!newTypeCycleId || !newMarqueId) {
            onChange(null);
            return;
        }

        const typeCycle = typesCycles.find((t) => t.id === newTypeCycleId);
        const marque = marques.find((m) => m.id === newMarqueId);
        if (!typeCycle || !marque) return;

        onChange({
            source: 'new',
            typeCycleId: newTypeCycleId,
            typeCycleLibelle: typeCycle.libelle,
            marqueId: newMarqueId,
            marqueLibelle: marque.libelle,
        });
    };

    return (
        <div className={styles.wrapper}>
            {hasCycles && (
                <>
                    <label className={styles.label} htmlFor="cycle-select">
                        Votre vélo
                    </label>
                    <select
                        id="cycle-select"
                        className={styles.select}
                        value={selectedCycleId}
                        onChange={(e) => handleExistingSelect(e.target.value)}
                    >
                        {userCycles!.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.libelle}
                            </option>
                        ))}
                        <option value={NEW_CYCLE_VALUE}>+ Nouveau vélo</option>
                    </select>
                </>
            )}

            {showNewFields && (
                <>
                    <label className={styles.label} htmlFor="type-cycle-select">
                        Type de cycle
                    </label>
                    <select
                        id="type-cycle-select"
                        className={styles.select}
                        value={typeCycleId}
                        onChange={(e) => handleNewFieldChange('type', e.target.value)}
                    >
                        <option value="">-- Sélectionner un type --</option>
                        {typesCycles.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.libelle}
                            </option>
                        ))}
                    </select>

                    <label className={styles.label} htmlFor="marque-select">
                        Marque
                    </label>
                    <select
                        id="marque-select"
                        className={styles.select}
                        value={marqueId}
                        onChange={(e) => handleNewFieldChange('marque', e.target.value)}
                    >
                        <option value="">-- Sélectionner une marque --</option>
                        {marques.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.libelle}
                            </option>
                        ))}
                    </select>
                </>
            )}
        </div>
    );
}
