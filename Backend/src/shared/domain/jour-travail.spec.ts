import { bornesDuJourTravail, jourTravail } from './jour-travail';

// Tests de caractérisation : ils figent le comportement actuel des fonctions
// de fuseau (Europe/Paris), écrites avant d'avoir leurs propres tests.
// Rappel : Paris est à UTC+1 en hiver et UTC+2 en été.

describe('jourTravail', () => {
    it('rattache 23h30 UTC en hiver au lendemain (00h30 à Paris)', () => {
        expect(jourTravail('2026-01-15T23:30:00.000Z')).toBe('2026-01-16');
    });

    it('rattache 22h30 UTC en été au lendemain (00h30 à Paris)', () => {
        expect(jourTravail('2026-07-15T22:30:00.000Z')).toBe('2026-07-16');
    });

    it('garde le jour même juste avant minuit à Paris', () => {
        expect(jourTravail('2026-07-15T21:30:00.000Z')).toBe('2026-07-15');
    });

    it('accepte une Date aussi bien qu’une chaîne', () => {
        expect(jourTravail(new Date('2026-01-15T10:00:00.000Z'))).toBe(
            '2026-01-15',
        );
    });
});

describe('bornesDuJourTravail', () => {
    it('encadre une journée d’hiver de minuit à minuit, heure de Paris', () => {
        const { debut, fin } = bornesDuJourTravail(
            new Date('2026-01-15T10:00:00.000Z'),
        );
        expect(debut.toISOString()).toBe('2026-01-14T23:00:00.000Z');
        expect(fin.toISOString()).toBe('2026-01-15T22:59:59.999Z');
    });

    it('encadre une journée d’été de minuit à minuit, heure de Paris', () => {
        const { debut, fin } = bornesDuJourTravail(
            new Date('2026-07-15T10:00:00.000Z'),
        );
        expect(debut.toISOString()).toBe('2026-07-14T22:00:00.000Z');
        expect(fin.toISOString()).toBe('2026-07-15T21:59:59.999Z');
    });
});
