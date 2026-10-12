import { CreneauAvecTechnicienDto } from '../dto/planning.dto';

/**
 * Règle métier centrale du tunnel de réservation.
 *
 * Un technicien ne peut pas enchaîner deux interventions collées : il lui faut
 * le temps de se déplacer. On réserve donc un slot libre de part et d'autre de
 * l'intervention — le « buffer aller » et le « buffer retour ».
 *
 * Un créneau n'est proposable que si la fenêtre [i-1 … i+k] est entièrement
 * libre ET contiguë, où k est le nombre de slots couverts par la durée du forfait.
 *
 * Deux exceptions assumées :
 * - le PREMIER slot de la journée est refusé (aucun buffer aller possible : le
 *   technicien vient de chez lui et doit avoir le temps d'arriver) ;
 * - le DERNIER slot de la journée est accepté sans buffer retour (le technicien
 *   rentre chez lui, inutile de lui bloquer un créneau).
 *
 * @param creneauxDuJour slots d'UN SEUL technicien sur UN SEUL jour, triés par
 *   dateDebut croissante, réservés compris — les slots occupés sont nécessaires
 *   pour distinguer « déjà pris » de « hors horaires ».
 * @param index position du créneau candidat dans ce tableau
 * @param dureeMinutes durée du forfait choisi par le client
 */
export function estCreneauReservable(
    creneauxDuJour: CreneauAvecTechnicienDto[],
    index: number,
    dureeMinutes: number,
): boolean {
    const candidat = creneauxDuJour[index];
    if (!candidat?.isDisponible) return false;

    // Un créneau détaché de son modèle de planification porte intervalleMinutes
    // = Infinity. On ne connaît alors ni son technicien ni la durée d'un slot :
    // les buffers sont invérifiables. Le proposer reviendrait à contourner toute
    // la règle, on le retire donc de l'offre.
    if (!Number.isFinite(candidat.intervalleMinutes)) return false;

    // Écart maximal toléré entre deux slots pour les considérer contigus
    const ecartMaxMs = candidat.intervalleMinutes * 60 * 1000;

    // ── 1. Buffer aller — le technicien doit pouvoir arriver ─────────────────
    // Pas de slot précédent = premier de la journée, ou reprise après une pause.
    if (index === 0) return false;

    const precedent = creneauxDuJour[index - 1];
    if (!precedent.isDisponible) return false;
    // Un écart supérieur à un slot n'est pas un temps de trajet mais un trou
    // (pause déjeuner). Il ne peut pas servir de buffer.
    if (ecartMs(precedent, candidat) > ecartMaxMs) return false;

    // ── 2. Couverture — l'intervention doit tenir dans des slots libres ──────
    const finIntervention =
        new Date(candidat.dateDebut).getTime() + dureeMinutes * 60 * 1000;

    let dernierCouvertIdx = index;
    for (let j = index; j < creneauxDuJour.length; j++) {
        const debutSlot = new Date(creneauxDuJour[j].dateDebut).getTime();
        if (debutSlot >= finIntervention) break;
        if (!creneauxDuJour[j].isDisponible) return false;
        dernierCouvertIdx = j;
    }

    // Les slots trouvés doivent réellement couvrir toute la durée. Sinon
    // l'intervention déborde dans un trou : pause déjeuner ou fin de journée.
    const dernierCouvert = creneauxDuJour[dernierCouvertIdx];
    const finDernierSlot =
        new Date(dernierCouvert.dateDebut).getTime() + ecartMaxMs;
    if (finDernierSlot < finIntervention) return false;

    // ── 3. Buffer retour — le technicien doit pouvoir repartir ───────────────
    const suivant = creneauxDuJour[dernierCouvertIdx + 1];
    // Aucun slot après : c'est la fin de la journée de travail, le technicien
    // rentre chez lui. On n'exige pas de buffer.
    if (!suivant) return true;

    if (!suivant.isDisponible) return false;
    return ecartMs(dernierCouvert, suivant) <= ecartMaxMs;
}

// Millisecondes écoulées entre les débuts de deux slots
function ecartMs(
    depuis: CreneauAvecTechnicienDto,
    vers: CreneauAvecTechnicienDto,
): number {
    return (
        new Date(vers.dateDebut).getTime() -
        new Date(depuis.dateDebut).getTime()
    );
}
