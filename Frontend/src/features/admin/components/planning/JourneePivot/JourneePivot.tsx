import type { ReactNode } from 'react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../../../../shared/components/ui/tabs';
import { useAdminZones } from '../../../hooks/useAdminZones';
import { useJournee } from '../../../hooks/useJournee';
import { formaterJour } from '../../../utils/jourCalendrier';
import { CarteTechnicienJour } from '../CarteTechnicienJour/CarteTechnicienJour';
import { CarteZoneJour } from '../CarteZoneJour/CarteZoneJour';
import styles from './JourneePivot.module.scss';

interface JourneePivotProps {
    date: string; // date pivot 'AAAA-MM-JJ' ('' tant qu'elle est inconnue)
    onVoirPlanning: (technicienId: string) => void; // ouvre la page du technicien
    // Emplacements de la partie haute, remplis par la section Planning : son
    // titre, et le calendrier avec sa légende (dans le même cadre)
    titre: ReactNode;
    calendrier: ReactNode;
}

/**
 * Page Planning, organisée autour des onglets de la journée (organisation
 * choisie par Yannick le 24/11/2026, pour tout voir sans défiler) :
 * - en haut, à gauche le titre puis la date et les onglets *Planning des
 *   techniciens* / *Disponibilités des zones* ; à droite, le calendrier et sa
 *   légende, du haut du titre jusqu'au bas des onglets ;
 * - en dessous, sur toute la largeur, la rangée de cartes de l'onglet choisi
 *   (niveaux 2 et 3 de l'US-02), mises à jour quand la date change.
 *
 * Pourquoi le calendrier et sa légende passent par ce composant : les boutons
 * des onglets et leur contenu doivent vivre dans le même composant Tabs, qui
 * les relie (y compris pour les lecteurs d'écran). Tabs englobe donc toute la
 * page ; le titre et le calendrier y sont glissés comme emplacements.
 */
export function JourneePivot({
    date,
    onVoirPlanning,
    titre,
    calendrier,
}: JourneePivotProps) {
    const { journee, isLoading, error } = useJournee(date);
    // Tracés des zones, pour les miniatures : la route des zones les donne
    // déjà (aucune donnée nouvelle côté API)
    const { items: zones } = useAdminZones();
    const tracePar = new Map(zones.map((z) => [z.id, z.points]));

    return (
        <Tabs defaultValue="techniciens" className={styles.page}>
            {/* À gauche, le titre puis la journée et ses onglets ; à droite,
                le calendrier et sa légende, du haut du titre jusqu'au bas des
                onglets (choix de Yannick du 24/11/2026) */}
            <div className={styles.haut}>
                <div className={styles.zoneTitre}>{titre}</div>

                <div className={styles.blocJournee}>
                    <p className={styles.date}>
                        Journée du
                        <strong className={styles.dateValeur}>
                            {formaterJour(date)}
                        </strong>
                    </p>

                    {journee && (
                        <TabsList className={styles.tabsList}>
                            <TabsTrigger
                                value="techniciens"
                                className={styles.tabsTrigger}
                            >
                                Planning des techniciens
                            </TabsTrigger>
                            <TabsTrigger
                                value="zones"
                                className={styles.tabsTrigger}
                            >
                                Disponibilités des zones
                            </TabsTrigger>
                        </TabsList>
                    )}
                </div>

                {calendrier}
            </div>

            {/* Les cartes, dans un cadre sur toute la largeur de la page :
                même style que le calendrier et la légende (choix de Yannick
                du 24/11/2026) */}
            <section className={styles.cadre} aria-label="Journée">
                {error && <p className={styles.error}>{error}</p>}
                {!journee && !error && isLoading && (
                    <p className={styles.info}>Chargement…</p>
                )}

                {journee && (
                    <>
                        <TabsContent value="techniciens">
                            {journee.techniciens.length === 0 ? (
                                <p className={styles.info}>Aucun technicien.</p>
                            ) : (
                                <div className={styles.rangee}>
                                    {journee.techniciens.map((c) => (
                                        <CarteTechnicienJour
                                            key={c.id}
                                            carte={c}
                                            onVoirPlanning={() =>
                                                onVoirPlanning(c.id)
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="zones">
                            {journee.zones.length === 0 ? (
                                <p className={styles.info}>Aucune zone.</p>
                            ) : (
                                <div className={styles.rangee}>
                                    {journee.zones.map((c) => (
                                        <CarteZoneJour
                                            key={c.id}
                                            carte={c}
                                            points={tracePar.get(c.id) ?? []}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </>
                )}
            </section>
        </Tabs>
    );
}
