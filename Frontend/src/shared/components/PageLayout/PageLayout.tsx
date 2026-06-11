import { Carousel } from '../Carousel/Carousel';
import styles from './PageLayout.module.scss';

// Images de fond — mobile et desktop
import fondEcranLyonMobile from '../../../assets/images/FondEcranLyonMobile.webp';
import fondEcranLyonDesktop from '../../../assets/images/FondEcranLyonDesktop.webp';
import reparationVeloMobile from '../../../assets/images/ReparationVeloMobile.webp';
import reparationVeloMobile2 from '../../../assets/images/ReparationVeloMobile2.webp'
import avis1 from '../../../assets/images/Avis1.webp';
import avis2 from '../../../assets/images/Avis2.webp'

// Images passées au carousel — à enrichir quand de nouvelles photos seront disponibles
const CAROUSEL_IMAGES = [
    reparationVeloMobile,
    avis1,
    reparationVeloMobile2,
    avis2
];

type PageLayoutProps = {
    children: React.ReactNode;
    leftContent?: React.ReactNode;
    compact?: boolean;
    noContentScroll?: boolean;
};

export function PageLayout({ children, leftContent, compact = true, noContentScroll = false }: PageLayoutProps) {
    return (
        <div className={`${styles.pageLayout} ${compact ? styles.compact : ''} ${noContentScroll ? styles.noContentScroll : ''}`}>
            {/* ── Section HAUTE ─────────────────────────────────────────────
                Mobile  : image Lyon + dégradé vers le vert menthe (bas)
                Desktop : image Lyon pleine hauteur (colonne gauche) + logo centré
            ─────────────────────────────────────────────────────────────── */}
            <div
                className={styles.topSection}
                style={{
                    '--bg-mobile': `url(${fondEcranLyonMobile})`,
                    '--bg-desktop': `url(${fondEcranLyonDesktop})`,
                } as React.CSSProperties}
                aria-hidden={leftContent ? undefined : true}
            >
                {leftContent && (
                    <div className={styles.leftOverlay}>{leftContent}</div>
                )}
            </div>

            {/* ── Section CENTRALE ──────────────────────────────────────────
                Contenu de la page (enfants)
                flex: 1 → remplit l'espace vertical disponible
            ─────────────────────────────────────────────────────────────── */}
            <main className={styles.contentSection}>
                {leftContent && (
                    <div className={styles.mobileHero}>{leftContent}</div>
                )}
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
