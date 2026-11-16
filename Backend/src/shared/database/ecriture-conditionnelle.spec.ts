import {
    EtatModifieEntreTempsError,
    estEtatModifieEntreTemps,
    exigerLignesModifiees,
} from './ecriture-conditionnelle';

describe('Écriture conditionnelle', () => {
    it('laisse passer quand le nombre de lignes modifiées est celui attendu', () => {
        expect(() => exigerLignesModifiees({ count: 1 })).not.toThrow();
        expect(() => exigerLignesModifiees({ count: 3 }, 3)).not.toThrow();
    });

    it('refuse quand aucune ligne n’a été modifiée : l’état a changé entre-temps', () => {
        expect(() => exigerLignesModifiees({ count: 0 })).toThrow(
            EtatModifieEntreTempsError,
        );
    });

    it('refuse quand une partie seulement des lignes a été modifiée', () => {
        // 3 créneaux attendus, 2 encore dans l'état voulu : tout ou rien
        expect(() => exigerLignesModifiees({ count: 2 }, 3)).toThrow(
            EtatModifieEntreTempsError,
        );
    });

    it('reconnaît son erreur, et seulement elle', () => {
        expect(
            estEtatModifieEntreTemps(new EtatModifieEntreTempsError(1, 0)),
        ).toBe(true);
        expect(estEtatModifieEntreTemps(new Error('autre'))).toBe(false);
        expect(estEtatModifieEntreTemps('pas une erreur')).toBe(false);
    });
});
