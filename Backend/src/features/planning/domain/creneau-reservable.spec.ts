import { CreneauAvecTechnicienDto } from '../dto/planning.dto';
import { estCreneauReservable } from './creneau-reservable';

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Un slot de la grille, le 2026-06-01. L'heure sert aussi d'identifiant lisible.
function slot(
    heure: string,
    disponible = true,
    intervalleMinutes = 30,
): CreneauAvecTechnicienDto {
    return {
        id: `slot-${heure}`,
        dateDebut: `2026-06-01T${heure}:00.000Z`,
        dateFin: null,
        isDisponible: disponible,
        zoneId: 'zone-uuid',
        modelePlanificationId: 'modele-uuid',
        technicienId: 'tech-uuid',
        technicienPrenom: 'Marc',
        intervalleMinutes,
    };
}

// Journée type d'un technicien : 8h00–12h00 puis pause déjeuner puis 14h00–16h00.
// La pause n'est pas matérialisée par des slots — elle se traduit par un TROU
// dans le tableau, entre l'index 7 (11:30) et l'index 8 (14:00).
//
//  idx   0     1     2     3     4     5     6     7  │  8     9    10    11
//      08:00 08:30 09:00 09:30 10:00 10:30 11:00 11:30│14:00 14:30 15:00 15:30
function journeeType(): CreneauAvecTechnicienDto[] {
    return [
        slot('08:00'),
        slot('08:30'),
        slot('09:00'),
        slot('09:30'),
        slot('10:00'),
        slot('10:30'),
        slot('11:00'),
        slot('11:30'),
        slot('14:00'),
        slot('14:30'),
        slot('15:00'),
        slot('15:30'),
    ];
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('estCreneauReservable', () => {
    // ── Cas nominal ───────────────────────────────────────────────────────────

    it('accepte un créneau encadré par deux slots libres et contigus', () => {
        // buffer aller 08:00 · intervention 08:30 · buffer retour 09:00
        expect(estCreneauReservable(journeeType(), 1, 30)).toBe(true);
    });

    it('accepte un forfait couvrant plusieurs slots consécutifs', () => {
        // buffer aller 08:00 · intervention 08:30+09:00 · buffer retour 09:30
        expect(estCreneauReservable(journeeType(), 1, 60)).toBe(true);
    });

    // ── Le créneau lui-même ───────────────────────────────────────────────────

    it('refuse un créneau déjà réservé', () => {
        const jour = journeeType();
        jour[1] = slot('08:30', false);

        expect(estCreneauReservable(jour, 1, 30)).toBe(false);
    });

    it('refuse un index hors du tableau', () => {
        expect(estCreneauReservable(journeeType(), -1, 30)).toBe(false);
        expect(estCreneauReservable(journeeType(), 99, 30)).toBe(false);
    });

    // ── Buffer aller (trajet vers le client) ──────────────────────────────────

    it("refuse le premier créneau de la journée — le technicien n'a pas le temps d'arriver", () => {
        expect(estCreneauReservable(journeeType(), 0, 30)).toBe(false);
    });

    it('refuse un créneau dont le buffer aller est déjà réservé', () => {
        const jour = journeeType();
        jour[0] = slot('08:00', false);

        expect(estCreneauReservable(jour, 1, 30)).toBe(false);
    });

    it('refuse le premier créneau après la pause déjeuner — buffer aller non contigu', () => {
        // index 8 = 14:00, son prédécesseur est 11:30 : 2h30 d'écart, ce n'est
        // pas un temps de trajet mais un trou de pause
        expect(estCreneauReservable(journeeType(), 8, 30)).toBe(false);
    });

    // ── Couverture par la durée du forfait ────────────────────────────────────

    it('refuse un créneau dont un slot couvert est réservé', () => {
        const jour = journeeType();
        jour[2] = slot('09:00', false);

        // forfait 60 min depuis 08:30 → couvre 08:30 et 09:00, or 09:00 est pris
        expect(estCreneauReservable(jour, 1, 60)).toBe(false);
    });

    it("refuse un créneau dont l'intervention déborderait dans la pause", () => {
        // 11:30 avec un forfait d'1h finirait à 12:30, or la journée s'arrête à
        // 12:00 — un seul slot ne couvre pas la durée demandée
        expect(estCreneauReservable(journeeType(), 7, 60)).toBe(false);
    });

    it("refuse un créneau dont l'intervention déborderait après la fin de journée", () => {
        // 15:30 avec un forfait d'1h finirait à 16:30, après le dernier slot
        expect(estCreneauReservable(journeeType(), 11, 60)).toBe(false);
    });

    // ── Buffer retour (trajet de retour) ──────────────────────────────────────

    it('refuse un créneau dont le buffer retour est réservé', () => {
        const jour = journeeType();
        jour[2] = slot('09:00', false);

        expect(estCreneauReservable(jour, 1, 30)).toBe(false);
    });

    it('refuse le dernier créneau avant la pause — buffer retour non contigu', () => {
        // 11:30 : le slot suivant dans le tableau est 14:00, de l'autre côté de
        // la pause. Ce n'est pas un temps de retour exploitable.
        expect(estCreneauReservable(journeeType(), 7, 30)).toBe(false);
    });

    it('accepte le dernier créneau de la journée — le technicien rentre chez lui', () => {
        // Asymétrie assumée : pas de buffer retour exigé en fin de journée
        expect(estCreneauReservable(journeeType(), 11, 30)).toBe(true);
    });

    // ── Créneaux manuels ──────────────────────────────────────────────────────

    it('ne contraint pas la contiguïté des créneaux manuels (intervalleMinutes infini)', () => {
        // Un créneau sans modèle de planification reçoit intervalleMinutes = Infinity
        // depuis le repository : il échappe volontairement aux tests d'écart.
        const jour = [
            slot('08:00', true, Infinity),
            slot('11:00', true, Infinity),
            slot('15:00', true, Infinity),
        ];

        expect(estCreneauReservable(jour, 1, 60)).toBe(true);
    });
});
