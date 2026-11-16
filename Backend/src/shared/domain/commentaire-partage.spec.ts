import { entreeCommentaire } from './commentaire-partage';

describe('Commentaire partagé — format d’une entrée', () => {
    it('précède le texte de la date, de l’heure de Paris et de l’auteur (hiver)', () => {
        // 14h42 UTC en janvier = 15h42 à Paris
        expect(
            entreeCommentaire(
                new Date('2026-01-16T14:42:00.000Z'),
                'Technicien',
                'Déclarée réalisée : 55 €, Carte bancaire.',
            ),
        ).toBe(
            '16/01/2026 15:42 — Technicien : Déclarée réalisée : 55 €, Carte bancaire.',
        );
    });

    it('prend l’heure d’été de Paris', () => {
        // 13h42 UTC en juillet = 15h42 à Paris
        expect(
            entreeCommentaire(
                new Date('2026-07-16T13:42:00.000Z'),
                'Admin',
                'Paiement corrigé.',
            ),
        ).toBe('16/07/2026 15:42 — Admin : Paiement corrigé.');
    });

    it('date l’entrée du jour de Paris, pas du jour UTC', () => {
        // 23h30 UTC le 15/01 = 00h30 le 16/01 à Paris
        expect(
            entreeCommentaire(
                new Date('2026-01-15T23:30:00.000Z'),
                'Système',
                'Intervention en conflit.',
            ),
        ).toBe('16/01/2026 00:30 — Système : Intervention en conflit.');
    });

    it('garde une ligne par entrée : les retours à la ligne du texte deviennent des espaces', () => {
        expect(
            entreeCommentaire(
                new Date('2026-01-16T14:42:00.000Z'),
                'Technicien',
                '  Client absent.\n\nRepassé à 11h.  ',
            ),
        ).toBe('16/01/2026 15:42 — Technicien : Client absent. Repassé à 11h.');
    });

    it('refuse un texte vide', () => {
        expect(() =>
            entreeCommentaire(new Date(), 'Admin', '   \n '),
        ).toThrow();
    });
});
