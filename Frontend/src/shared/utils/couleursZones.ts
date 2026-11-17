/**
 * Palette des zones — seul endroit du frontend qui associe un nom de couleur à
 * sa teinte (Frontend/CLAUDE.md, « Constantes d'affichage partagées »).
 *
 * L'API ne transmet que le NOM (« Bleu ») ; la conversion en code hexadécimal se
 * fait ici. Valeurs : note « Refonte 2.0 » du vault, Énumérations (teinte 7 de
 * la palette Open Color). L'ordre est celui de la palette : la première couleur
 * est présélectionnée à la création d'une zone.
 */
export const PALETTE_ZONES = [
    { nom: 'Rouge', hex: '#f03e3e' },
    { nom: 'Orange', hex: '#f76707' },
    { nom: 'Jaune', hex: '#f59f00' },
    { nom: 'Lime', hex: '#74b816' },
    { nom: 'Vert', hex: '#37b24d' },
    { nom: 'Turquoise', hex: '#0ca678' },
    { nom: 'Cyan', hex: '#1098ad' },
    { nom: 'Bleu', hex: '#1c7ed6' },
    { nom: 'Indigo', hex: '#4263eb' },
    { nom: 'Violet', hex: '#7048e8' },
    { nom: 'Prune', hex: '#ae3ec9' },
    { nom: 'Rose', hex: '#d6336c' },
] as const;

/** Un nom de la palette : 'Rouge' | 'Orange' | … | 'Rose'. */
export type CouleurZone = (typeof PALETTE_ZONES)[number]['nom'];

/** Couleur présélectionnée à la création d'une zone : la première de la palette. */
export const COULEUR_ZONE_PAR_DEFAUT: CouleurZone = PALETTE_ZONES[0].nom;

/**
 * Gris d'une zone inactive. Ce n'est PAS une couleur de la palette : il ne se
 * choisit pas, n'est jamais envoyé à l'API et n'est pas stocké.
 */
export const GRIS_ZONE_INACTIVE = '#ced4da';

/** Code hexadécimal d'un nom de la palette. */
export function hexDeCouleur(couleur: CouleurZone): string {
    // find ne peut pas échouer : le type CouleurZone n'admet que les 12 noms
    return (
        PALETTE_ZONES.find((c) => c.nom === couleur)?.hex ?? GRIS_ZONE_INACTIVE
    );
}

/**
 * Teinte à afficher pour une zone, partout où elle apparaît : sa couleur si
 * elle est active, le gris clair sinon. La couleur enregistrée n'est jamais
 * modifiée : la zone la retrouve dès qu'elle est réactivée.
 */
export function couleurAffichee(zone: {
    couleur: CouleurZone;
    isActive: boolean;
}): string {
    return zone.isActive ? hexDeCouleur(zone.couleur) : GRIS_ZONE_INACTIVE;
}
