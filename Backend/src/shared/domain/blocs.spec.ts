import {
    blocsPossibles,
    nombreDeCreneaux,
    type CreneauPlanifie,
    type StatutCreneau,
} from './blocs';
import { instantDuJour, jourTravail } from './jour-travail';

// Critères de l'US-02 qui portent sur la règle pure du calcul des blocs
// (RG5, RG7 à RG12 de « (Client) Réserver une intervention 2.0 »). Les autres
// critères de l'US (accès, refus, horizon, attribution, réponse) seront testés
// au niveau du use case.

const JOUR = '2026-06-01'; // un lundi
const ZONE = 'zone-est';
const TECH = 'tech-1';

// Un créneau de 30 min à « hh:mm » le jour de test, heure de Paris
function creneau(
    heure: string,
    statut: StatutCreneau = 'Libre',
    technicienId = TECH,
    zoneId = ZONE,
): CreneauPlanifie {
    const [h, m] = heure.split(':').map(Number);
    return {
        id: `${technicienId}-${heure}`,
        technicienId,
        zoneId,
        dateDebut: instantDuJour(JOUR, h * 60 + m),
        statut,
    };
}

// Les créneaux de 30 min de `debut` (inclus) à `fin` (exclue)
function suite(
    debut: string,
    fin: string,
    technicienId = TECH,
    zoneId = ZONE,
): CreneauPlanifie[] {
    const enMinutes = (h: string) => {
        const [hh, mm] = h.split(':').map(Number);
        return hh * 60 + mm;
    };
    const creneaux: CreneauPlanifie[] = [];
    for (let m = enMinutes(debut); m < enMinutes(fin); m += 30) {
        const heure = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        creneaux.push(creneau(heure, 'Libre', technicienId, zoneId));
    }
    return creneaux;
}

// Remplace le statut des créneaux aux heures données
function avecStatut(
    creneaux: CreneauPlanifie[],
    statuts: Record<string, StatutCreneau>,
): CreneauPlanifie[] {
    return creneaux.map((c) => {
        const heure = c.id.slice(c.id.lastIndexOf('-') + 1);
        return statuts[heure] ? { ...c, statut: statuts[heure] } : c;
    });
}

// Heures de début (heure de Paris) des blocs trouvés
function heuresDeDebut(creneaux: CreneauPlanifie[], duree: number): string[] {
    return blocsPossibles(creneaux, ZONE, duree).map((b) =>
        b.debut.toLocaleTimeString('fr-FR', {
            timeZone: 'Europe/Paris',
            hour: '2-digit',
            minute: '2-digit',
        }),
    );
}

describe('US-02 Calculer et proposer les horaires disponibles 2.0', () => {
    it('CA05 — un forfait de 30, 45 ou 90 min occupe 1, 2 ou 3 créneaux d’intervention [RG7]', () => {
        expect(nombreDeCreneaux(30)).toBe(1);
        expect(nombreDeCreneaux(45)).toBe(2);
        expect(nombreDeCreneaux(90)).toBe(3);
    });

    it('CA06 — une suite 8h00–12h00 libre et un forfait de 60 min donnent 8h30, 9h00, 9h30, 10h00 et 10h30 [RG7, RG8, RG9, RG11]', () => {
        expect(heuresDeDebut(suite('08:00', '12:00'), 60)).toEqual([
            '08:30',
            '09:00',
            '09:30',
            '10:00',
            '10:30',
        ]);
    });

    it('CA07 — le premier créneau d’une suite n’est jamais proposé, le dernier ne fait jamais partie de l’intervention [RG11]', () => {
        const blocs = blocsPossibles(suite('08:00', '12:00'), ZONE, 30);
        const premier = `${TECH}-08:00`;
        const dernier = `${TECH}-11:30`;
        for (const bloc of blocs) {
            expect(bloc.creneauxIntervention).not.toContain(premier);
            expect(bloc.creneauxIntervention).not.toContain(dernier);
        }
        // Le premier sert de déplacement aller, le dernier de déplacement retour
        expect(blocs[0].deplacementAvant.creneauId).toBe(premier);
        expect(blocs[blocs.length - 1].deplacementApres.creneauId).toBe(
            dernier,
        );
    });

    it('CA08 — deux suites 8h00–12h00 et 13h00–17h00 : aucun bloc ne traverse la pause, 60 min ne commence pas à 11h00 [RG12]', () => {
        const creneaux = [
            ...suite('08:00', '12:00'),
            ...suite('13:00', '17:00'),
        ];
        const debuts = heuresDeDebut(creneaux, 60);
        expect(debuts).not.toContain('11:00');
        expect(debuts).not.toContain('11:30');
        expect(debuts).toContain('10:30');
        expect(debuts).toContain('13:30');
    });

    it('CA09 — une intervention de 9h00 à 10h00 avec son déplacement à 10h00 : un bloc à 10h30 réutilise ce déplacement [RG10]', () => {
        const creneaux = avecStatut(suite('08:00', '12:00'), {
            '08:30': 'Deplacement',
            '09:00': 'InterventionReservee',
            '09:30': 'InterventionReservee',
            '10:00': 'Deplacement',
        });
        const bloc = blocsPossibles(creneaux, ZONE, 60).find(
            (b) =>
                b.debut.getTime() ===
                instantDuJour(JOUR, 10 * 60 + 30).getTime(),
        );
        expect(bloc).toBeDefined();
        expect(bloc!.deplacementAvant).toEqual({
            creneauId: `${TECH}-10:00`,
            reutilise: true,
        });
    });

    it('CA10 — un créneau Intervention réservée ou Déplacement n’est jamais proposé comme heure de début [RG5]', () => {
        const creneaux = avecStatut(suite('08:00', '12:00'), {
            '09:00': 'InterventionReservee',
            '10:00': 'Deplacement',
        });
        const debuts = heuresDeDebut(creneaux, 30);
        expect(debuts).not.toContain('09:00');
        expect(debuts).not.toContain('10:00');
    });

    it('CA11 — un créneau Intervention réservée au milieu d’un bloc rend ce bloc impossible [RG8]', () => {
        const creneaux = avecStatut(suite('08:00', '12:00'), {
            '09:30': 'InterventionReservee',
        });
        // 60 min à 9h00 couvrirait 9h00 et 9h30 : impossible
        expect(heuresDeDebut(creneaux, 60)).not.toContain('09:00');
    });

    it('CA12 — des créneaux contigus de deux techniciens différents ne forment jamais un bloc [RG8]', () => {
        // 8h00–9h00 pour l'un, 9h00–10h00 pour l'autre : chacun n'a que 2 créneaux
        const creneaux = [
            ...suite('08:00', '09:00', 'tech-1'),
            ...suite('09:00', '10:00', 'tech-2'),
        ];
        expect(blocsPossibles(creneaux, ZONE, 30)).toEqual([]);
    });

    it('CA13 — les créneaux d’une autre zone sont ignorés [RG8]', () => {
        const creneaux = suite('08:00', '12:00', TECH, 'zone-ouest');
        expect(blocsPossibles(creneaux, ZONE, 30)).toEqual([]);
        // Contrôle : la même suite dans la zone demandée donne des blocs, le même jour
        const blocs = blocsPossibles(suite('08:00', '12:00'), ZONE, 30);
        expect(blocs.length).toBeGreaterThan(0);
        expect(blocs.every((b) => b.jour === jourTravail(b.debut))).toBe(true);
    });
});
