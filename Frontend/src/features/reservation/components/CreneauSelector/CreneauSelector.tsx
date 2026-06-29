import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { EventClickArg } from '@fullcalendar/core';
import { useRef, useState } from 'react';
import { useReservation } from '../../../../app/providers/reservationContext/useReservation';
import { useAuth } from '../../../../app/providers/authContext/useAuth';
import { useCreneaux } from '../../hooks/useCreneaux';
import { CTAButton } from '../../../../shared/components/CTAButton/CTAButton';
import type { CreneauInfo } from '../../../../app/providers/reservationContext/types/reservation.types';
import styles from './CreneauSelector.module.scss';

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function toLocalDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatDayName(dateStr: string): string {
    return new Date(`${dateStr}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long' });
}

export function CreneauSelector() {
    const { zone, forfait, setCreneau, goToStep } = useReservation();
    const { isAuthenticated } = useAuth();
    const calendarRef = useRef<FullCalendar>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const { creneaux, isLoading, error } = useCreneaux(
        zone?.zoneId ?? '',
        forfait?.dureeMinutes ?? 0,
    );

    const today = toLocalDateString(new Date());
    const maxDate = toLocalDateString(new Date(new Date().getTime() + 28 * 24 * 60 * 60 * 1000));

    const [currentDate, setCurrentDate] = useState(today);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Durée d'un slot individuel = espacement minimum entre créneaux consécutifs.
    // On prend le minimum (et non les deux premiers) car la liste peut contenir des trous
    // (créneaux réservés, pauses) qui fausseraient le calcul si on se basait uniquement
    // sur creneaux[0] et creneaux[1].
    const slotDurationMs =
        creneaux.length >= 2
            ? Math.min(
                  ...creneaux
                      .slice(0, -1)
                      .map(
                          (c, i) =>
                              new Date(creneaux[i + 1].dateDebut).getTime() -
                              new Date(c.dateDebut).getTime(),
                      ),
              )
            : 30 * 60 * 1000;

    const navigate = (direction: 'prev' | 'next') => {
        calendarRef.current?.getApi()[direction === 'prev' ? 'prev' : 'next']();
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value && calendarRef.current) {
            calendarRef.current.getApi().gotoDate(e.target.value);
        }
    };

    // Ouvre le sélecteur de date natif du navigateur
    const handleCalendarOpen = () => {
        if (!dateInputRef.current) return;
        const input = dateInputRef.current as HTMLInputElement & { showPicker?: () => void };
        if (typeof input.showPicker === 'function') {
            input.showPicker();
        } else {
            input.focus();
        }
    };

    const handleEventClick = (info: EventClickArg) => {
        setSelectedId(info.event.id);
    };

    const handleConfirm = () => {
        if (!selectedId) return;
        const creneau = creneaux.find((c) => c.id === selectedId);
        if (!creneau) return;

        const creneauInfo: CreneauInfo = {
            creneauId: creneau.id,
            dateDebut: creneau.dateDebut,
            dateFin: creneau.dateFin,
            technicienId: creneau.technicienId,
        };

        setCreneau(creneauInfo);
        goToStep(isAuthenticated ? 'confirmation' : 'auth');
    };

    // Filtre défensif : exclut les créneaux dont date_fin déborde dans un gap (ex: pause déjeuner).
    // Le backend devrait déjà garantir cela, mais ce filtre évite toute incohérence visuelle.
    const creneauxValides = creneaux.filter((c) => {
        const dateFin = new Date(c.dateFin).getTime();
        const slotsAvantFin = creneaux.filter(
            (s) => new Date(s.dateDebut).getTime() < dateFin,
        );
        const dernierSlot = slotsAvantFin[slotsAvantFin.length - 1];
        if (!dernierSlot) return false;
        return new Date(dernierSlot.dateDebut).getTime() >= dateFin - slotDurationMs;
    });

    const events = creneauxValides.map((c) => {
        const isSelected = c.id === selectedId;
        return {
            id: c.id,
            start: c.dateDebut,
            end: isSelected
                ? c.dateFin
                : new Date(new Date(c.dateDebut).getTime() + slotDurationMs).toISOString(),
            extendedProps: { dateFin: c.dateFin, isSelected },
            backgroundColor: isSelected ? '#f26419' : '#d6f6dd',
            borderColor: isSelected ? '#f26419' : '#d6f6dd',
            textColor: isSelected ? '#ffffff' : '#4f3b30',
        };
    });

    if (isLoading) return <p className={styles.statusText}>Chargement des créneaux...</p>;
    if (error) return <p className={styles.errorText}>{error}</p>;

    const firstAvailableDate =
        creneauxValides.length > 0
            ? toLocalDateString(new Date(creneauxValides[0].dateDebut))
            : today;

    return (
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>Choisissez votre créneau</h2>

            {creneaux.length === 0 ? (
                <p className={styles.statusText}>
                    Aucun créneau disponible sur les 4 prochaines semaines.
                </p>
            ) : (
                <div className={styles.calendarWrapper}>
                    <div className={styles.customToolbar}>
                        <button
                            className={styles.navButton}
                            onClick={() => navigate('prev')}
                            disabled={currentDate <= today}
                            aria-label="Jour précédent"
                        >
                            ‹
                        </button>

                        {/* Bouton central : affiche date + jour, ouvre le picker au clic */}
                        <button className={styles.dateTrigger} onClick={handleCalendarOpen}>
                            <span className={styles.dateText}>{formatDisplayDate(currentDate)}</span>
                            <span className={styles.dateSeparator}> · </span>
                            <span className={styles.dayName}>{formatDayName(currentDate)}</span>
                        </button>

                        {/* Input caché — piloté par handleDateChange et showPicker */}
                        <input
                            ref={dateInputRef}
                            type="date"
                            className={styles.hiddenDateInput}
                            value={currentDate}
                            min={today}
                            max={maxDate}
                            onChange={handleDateChange}
                            tabIndex={-1}
                            aria-hidden="true"
                        />

                        <button
                            className={styles.navButton}
                            onClick={() => navigate('next')}
                            disabled={currentDate >= maxDate}
                            aria-label="Jour suivant"
                        >
                            ›
                        </button>
                    </div>

                    <div className={styles.calendarScrollArea}>
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridDay"
                        initialDate={firstAvailableDate}
                        locale={frLocale}
                        headerToolbar={false}
                        allDaySlot={false}
                        validRange={{ start: new Date() }}
                        slotMinTime="08:00:00"
                        slotMaxTime="19:00:00"
                        events={events}
                        eventClick={handleEventClick}
                        height="auto"
                        datesSet={(dateInfo) => {
                            setCurrentDate(toLocalDateString(dateInfo.start));
                        }}
                        eventContent={(arg) => {
                            const isSelected = arg.event.extendedProps['isSelected'] as boolean;
                            if (!isSelected) return <div />;
                            const dateFin = arg.event.extendedProps['dateFin'] as string;
                            return (
                                <div className={styles.eventContent}>
                                    <span className={styles.eventTime}>
                                        {formatTime(arg.event.startStr)} → {formatTime(dateFin)}
                                    </span>
                                </div>
                            );
                        }}
                    />
                    </div>
                </div>
            )}

            <div className={styles.actions}>
                <CTAButton
                    onClick={handleConfirm}
                    disabled={!selectedId}
                    className={styles.ctaFullWidth}
                >
                    Confirmer ce créneau
                </CTAButton>
                <button className={styles.backButton} onClick={() => goToStep('cycle')}>
                    Retour
                </button>
            </div>
        </div>
    );
}
