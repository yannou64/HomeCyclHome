import { Footer } from '../Footer/Footer';
import { Header } from '../Header/Header';
import styles from './LegalPageLayout.module.scss';

type LegalPageLayoutProps = {
    title: string;
    updated?: string;
    children: React.ReactNode;
};

export function LegalPageLayout({ title, updated, children }: LegalPageLayoutProps) {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.wrapper}>
                    <h1 className={styles.title}>{title}</h1>
                    {updated && <p className={styles.updated}>{updated}</p>}
                    {children}
                </div>
            </main>
            <Footer />
        </>
    );
}

type LegalSectionProps = {
    title: string;
    children: React.ReactNode;
};

export function LegalSection({ title, children }: LegalSectionProps) {
    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            {children}
        </div>
    );
}

type LegalTextProps = { children: React.ReactNode };

export function LegalText({ children }: LegalTextProps) {
    return <p className={styles.text}>{children}</p>;
}

export function LegalList({ children }: LegalTextProps) {
    return <ul className={styles.list}>{children}</ul>;
}
