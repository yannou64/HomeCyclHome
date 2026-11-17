/**
 * Palette des zones : les 12 noms de couleur acceptés par l'API, dans l'ordre de
 * la palette (spec : cas d'utilisation « (Admin) Choisir la couleur d'une zone
 * 2.0 », valeurs dans « Refonte 2.0 », Énumérations).
 *
 * Seul le NOM circule entre l'API et la base ; le code hexadécimal n'existe que
 * dans l'interface. Le gris d'une zone inactive n'est pas une couleur de la
 * palette : il n'est jamais accepté ni stocké.
 *
 * Cette liste double l'énumération Prisma `CouleurZone`, que les DTO ne peuvent
 * pas importer (le client Prisma reste dans les repositories). Les deux restent
 * alignées : le repository passe ce type à Prisma, et TypeScript refuserait un
 * nom qui n'existerait pas dans l'énumération.
 */
export const COULEURS_ZONE = [
    'Rouge',
    'Orange',
    'Jaune',
    'Lime',
    'Vert',
    'Turquoise',
    'Cyan',
    'Bleu',
    'Indigo',
    'Violet',
    'Prune',
    'Rose',
] as const;

/** Un nom de la palette : 'Rouge' | 'Orange' | … | 'Rose'. */
export type CouleurZone = (typeof COULEURS_ZONE)[number];

/** Message de refus d'une couleur hors palette, en français et précis. */
export const MESSAGE_COULEUR_INVALIDE = `La couleur doit être l'une des 12 couleurs de la palette : ${COULEURS_ZONE.join(', ')}.`;
