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

    // Durée d'un slot de la grille, fournie par l'API. Elle ne peut plus être
    // déduite des écarts entre créneaux consécutifs : la liste peut mêler
    // plusieurs techniciens, deux entrées voisines n'ont donc pas forcément de
    // rapport temporel entre elles.
    const slotDurationMs = (creneaux[0]?.intervalleMinutes ?? 30) * 60 * 1000;

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
            technicienPrenom: creneau.technicienPrenom,
        };

        setCreneau(creneauInfo);
        goToStep(isAuthenticated ? 'confirmation' : 'auth');
    };

    // Aucun filtrage métier ici : le backend ne renvoie que des créneaux
    // réellement réservables (buffers de déplacement et couverture du forfait
    // vérifiés par la règle de domaine).
    const events = creneaux.map((c) => {
        const isSelected = c.id === selectedId;
        return {
            id: c.id,
            start: c.dateDebut,
            end: isSelected
                ? c.dateFin
                : new Date(new Date(c.dateDebut).getTime() + slotDurationMs).toISOString(),
            extendedProps: {
                dateFin: c.dateFin,
                isSelected,
                technicienPrenom: c.technicienPrenom,
            },
            backgroundColor: isSelected ? '#f26419' : '#d6f6dd',
            borderColor: isSelected ? '#f26419' : '#d6f6dd',
            textColor: isSelected ? '#ffffff' : '#4f3b30',
        };
    });

    if (isLoading) return <p className={styles.statusText}>Chargement des créneaux...</p>;
    if (error) return <p className={styles.errorText}>{error}</p>;

    const firstAvailableDate =
        creneaux.length > 0
            ? toLocalDateString(new Date(creneaux[0].dateDebut))
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
                            const technicienPrenom = arg.event.extendedProps[
                                'technicienPrenom'
                            ] as string | null;

                            // Bloc non sélectionné : hauteur d'un seul slot, on se
                            // limite au prénom du technicien.
                            if (!isSelected) {
                                return (
                                    <div className={styles.eventContent}>
                                        {technicienPrenom && (
                                            <span className={styles.eventTechnicien}>
                                                {technicienPrenom}
                                            </span>
                                        )}
                                    </div>
                                );
                            }

                            const dateFin = arg.event.extendedProps['dateFin'] as string;
                            return (
                                <div className={styles.eventContent}>
                                    <span className={styles.eventTime}>
                                        {formatTime(arg.event.startStr)} → {formatTime(dateFin)}
                                    </span>
                                    {technicienPrenom && (
                                        <span className={styles.eventTechnicien}>
                                            avec {technicienPrenom}
                                        </span>
                                    )}
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
