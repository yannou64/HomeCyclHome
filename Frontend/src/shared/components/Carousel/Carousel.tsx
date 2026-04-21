import styles from './Carousel.module.scss';

type CarouselProps = {
    images: string[];
    alt?: string;
    speed?: number; // durée en secondes pour un cycle complet
};

export function Carousel({ images, alt = '', speed = 25 }: CarouselProps) {
    // Les images sont dupliquées pour créer la boucle infinie seamless :
    // on anime de 0% à -50% de la largeur totale, puis on recommence
    const loopedImages = [...images, ...images];

    return (
        <div className={styles.carousel} aria-hidden="true">
            <div
                className={styles.track}
                style={{ animationDuration: `${speed}s` }}
            >
                {loopedImages.map((src, index) => (
                    <img
                        key={index}
                        src={src}
                        alt={alt}
                        className={styles.slide}
                    />
                ))}
            </div>
        </div>
    );
}
