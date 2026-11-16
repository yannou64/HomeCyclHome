import {
    ajouterJours,
    aujourdHui,
    bornesDuJourTravail,
    instantDuJour,
    jourDeSemaine,
    jourTravail,
} from './jour-travail';

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

    it('compte 23 h le jour du passage à l’heure d’été (29/03/2026)', () => {
        const { debut, fin } = bornesDuJourTravail(
            new Date('2026-03-29T10:00:00.000Z'),
        );
        // Minuit en heure d'hiver (UTC+1), minuit suivant en heure d'été (UTC+2)
        expect(debut.toISOString()).toBe('2026-03-28T23:00:00.000Z');
        expect(fin.toISOString()).toBe('2026-03-29T21:59:59.999Z');
    });

    it('compte 25 h le jour du retour à l’heure d’hiver (25/10/2026)', () => {
        const { debut, fin } = bornesDuJourTravail(
            new Date('2026-10-25T10:00:00.000Z'),
        );
        // Minuit en heure d'été (UTC+2), minuit suivant en heure d'hiver (UTC+1)
        expect(debut.toISOString()).toBe('2026-10-24T22:00:00.000Z');
        expect(fin.toISOString()).toBe('2026-10-25T22:59:59.999Z');
    });
});

describe('instantDuJour', () => {
    it('donne 8h00 de Paris en hiver (UTC+1)', () => {
        expect(instantDuJour('2026-01-15', 8 * 60).toISOString()).toBe(
            '2026-01-15T07:00:00.000Z',
        );
    });

    it('donne 8h30 de Paris en été (UTC+2)', () => {
        expect(instantDuJour('2026-07-15', 8 * 60 + 30).toISOString()).toBe(
            '2026-07-15T06:30:00.000Z',
        );
    });

    it('donne l’heure d’horloge le jour du passage à l’heure d’été', () => {
        // Le 29/03, minuit est en UTC+1 mais 8h00 est déjà en UTC+2
        expect(instantDuJour('2026-03-29', 0).toISOString()).toBe(
            '2026-03-28T23:00:00.000Z',
        );
        expect(instantDuJour('2026-03-29', 8 * 60).toISOString()).toBe(
            '2026-03-29T06:00:00.000Z',
        );
    });

    it('donne l’heure d’horloge le jour du retour à l’heure d’hiver', () => {
        // Le 25/10, minuit est en UTC+2 mais 8h00 est déjà en UTC+1
        expect(instantDuJour('2026-10-25', 8 * 60).toISOString()).toBe(
            '2026-10-25T07:00:00.000Z',
        );
    });

    it('est l’inverse de jourTravail', () => {
        expect(jourTravail(instantDuJour('2026-03-29', 23 * 60 + 30))).toBe(
            '2026-03-29',
        );
    });
});

describe('ajouterJours', () => {
    it('passe les fins de mois et d’année', () => {
        expect(ajouterJours('2026-01-31', 1)).toBe('2026-02-01');
        expect(ajouterJours('2026-12-31', 1)).toBe('2027-01-01');
        expect(ajouterJours('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('traverse un changement d’heure sans glisser d’un jour', () => {
        expect(ajouterJours('2026-03-28', 1)).toBe('2026-03-29');
        expect(ajouterJours('2026-03-29', 1)).toBe('2026-03-30');
        expect(ajouterJours('2026-10-25', 30)).toBe('2026-11-24');
    });
});

describe('jourDeSemaine', () => {
    it('numérote de 0 (dimanche) à 6 (samedi)', () => {
        expect(jourDeSemaine('2026-11-15')).toBe(0); // dimanche
        expect(jourDeSemaine('2026-11-16')).toBe(1); // lundi
        expect(jourDeSemaine('2026-11-21')).toBe(6); // samedi
    });
});

describe('aujourdHui', () => {
    it('donne le jour de Paris, pas le jour UTC', () => {
        // 23h30 UTC le 15/01 = 00h30 le 16/01 à Paris
        expect(aujourdHui(new Date('2026-01-15T23:30:00.000Z'))).toBe(
            '2026-01-16',
        );
    });
});
