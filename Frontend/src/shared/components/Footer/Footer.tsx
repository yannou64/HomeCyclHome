import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.scss';

const LEGAL_LINKS = [
    { label: 'Mentions légales', to: '/mentions-legales' },
    { label: 'CGU', to: '/cgu' },
    { label: 'Confidentialité', to: '/confidentialite' },
];

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <nav aria-label="Liens légaux" className={styles.legalNav}>
                    {LEGAL_LINKS.map((link, index) => (
                        <Fragment key={link.to}>
                            {index > 0 && (
                                <span aria-hidden="true" className={styles.separator}>·</span>
                            )}
                            <Link to={link.to} className={styles.legalLink}>
                                {link.label}
                            </Link>
                        </Fragment>
                    ))}
                </nav>
                <p className={styles.copyright}>© LeCycleLyonnais {currentYear}</p>
            </div>
        </footer>
    );
}
