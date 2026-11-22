import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import type { DatesSetArg, DayCellContentArg } from '@fullcalendar/core';
import type { CSSProperties } from 'react';
import type {
    CouvertureMois,
    ZoneCouverte,
} from '../../../types/planning.types';
import { jourDeCase, moisDeCase } from '../../../utils/jourCalendrier';
import { couleurAffichee } from '../../../../../shared/utils/couleursZones';
import styles from './CalendrierCouverture.module.scss';

interface CalendrierCouvertureProps {
    couverture: CouvertureMois;
    datePivot: string; // 'AAAA-MM-JJ', mise en évidence
    onMoisChange: (mois: string) => void; // flèches : mois précédent ou suivant
    onChoisirDate: (jour: string) => void; // clic sur un jour : date pivot
}

/**
 * Calendrier du mois (US-01 « Consulter le calendrier de couverture et
 * choisir une date 2.0 ») : chaque jour porte un point par zone couverte, de
 * la couleur de la zone (gris clair si elle est inactive). Vue mois de
 * FullCalendar, comme le calendrier de réservation (choix de Yannick).
 */
export function CalendrierCouverture({
    couverture,
    datePivot,
    onMoisChange,
    onChoisirDate,
}: CalendrierCouvertureProps) {
    // Zones de chaque jour couvert, pour retrouver vite celles d'une case
    const zonesParJour = new Map(
        couverture.jours.map((j) => [j.jour, j.zones]),
    );

    return (
        <div className={styles.calendrier}>
            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                // Lu une seule fois, au montage : le mois du jour (RG4)
                initialDate={couverture.aujourdHui}
                locale={frLocale}
                headerToolbar={{ left: 'prev', center: 'title', right: 'next' }}
                fixedWeekCount={false}
                height="auto"
                datesSet={(arg: DatesSetArg) =>
                    onMoisChange(moisDeCase(arg.view.currentStart))
                }
                dateClick={(arg) => onChoisirDate(jourDeCase(arg.date))}
                dayCellClassNames={(arg) =>
                    jourDeCase(arg.date) === datePivot
                        ? [styles.selectionne]
                        : []
                }
                dayCellContent={(arg: DayCellContentArg) => (
                    <ContenuCase
                        numero={arg.dayNumberText}
                        zones={zonesParJour.get(jourDeCase(arg.date)) ?? []}
                    />
                )}
            />
        </div>
    );
}

interface ContenuCaseProps {
    numero: string;
    zones: ZoneCouverte[];
}

/** Numéro du jour, puis un point par zone couverte ce jour-là (RG3). */
function ContenuCase({ numero, zones }: ContenuCaseProps) {
    return (
        <div className={styles.case}>
            <span className={styles.numero}>{numero}</span>
            <span className={styles.points}>
                {zones.map((z) => (
                    <span
                        key={z.id}
                        className={styles.point}
                        // Teinte calculée à l'exécution : variable CSS
                        style={
                            {
                                '--point-couleur': couleurAffichee(z),
                            } as CSSProperties
                        }
                        title={z.nomZone}
                    />
                ))}
            </span>
        </div>
    );
}
