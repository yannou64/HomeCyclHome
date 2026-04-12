import { Carousel } from '../Carousel/Carousel';
import styles from './PageLayout.module.scss';

// Images de fond — mobile et desktop
import fondEcranLyonMobile from '../../../assets/images/FondEcranLyonMobile.webp';
import fondEcranLyonDesktop from '../../../assets/images/FondEcranLyonDesktop.webp';
import reparationVeloMobile from '../../../assets/images/ReparationVeloMobile.webp';
import reparationVeloDesktop from '../../../assets/images/ReparationVeloDesktop.webp';

// Images passées au carousel — à enrichir quand de nouvelles photos seront disponibles
const CAROUSEL_IMAGES = [
    reparationVeloMobile,
    reparationVeloDesktop,
];

type PageLayoutProps = {
    children: React.ReactNode;
};

export function PageLayout({ children }: PageLayoutProps) {
    return (
        <div className={styles.pageLayout}>
            {/* ── Section HAUTE ─────────────────────────────────────────────
                Mobile  : image Lyon + dégradé vers le vert menthe (bas)
                Desktop : image Lyon couvrant toute la hauteur (colonne gauche)
            ─────────────────────────────────────────────────────────────── */}
            <div
                className={styles.topSection}
                style={{
                    '--bg-mobile': `url(${fondEcranLyonMobile})`,
                    '--bg-desktop': `url(${fondEcranLyonDesktop})`,
                } as React.CSSProperties}
                aria-hidden="true"
            />

            {/* ── Section CENTRALE ──────────────────────────────────────────
                Contenu de la page (enfants)
                flex: 1 → remplit l'espace vertical disponible
            ─────────────────────────────────────────────────────────────── */}
            <main className={styles.contentSection}>
                {children}
            </main>

            {/* ── Section BASSE ─────────────────────────────────────────────
                Mobile  : dégradé vert menthe → transparent + carousel
                Desktop : carousel (colonne droite, ligne basse)
            ─────────────────────────────────────────────────────────────── */}
            <div className={styles.bottomSection}>
                <Carousel images={CAROUSEL_IMAGES} speed={30} />
            </div>
        </div>
    );
}
