import styles from './HeroBrand.module.scss';
import logo from "../../../assets/images/logo homecycl'home 750-750.webp";

export function HeroBrand() {
    return (
        <div className={styles.heroBrand}>
            <img
                src={logo}
                alt="HomeCycl'Home — Réparation & Entretien à Domicile"
                className={styles.logo}
            />
        </div>
    );
}
