import styles from './Card.module.scss';

type CardProps = {
    children: React.ReactNode;
    className?: string;
};

export function Card({ children, className }: CardProps) {
    return (
        <div className={`${styles.card} ${className ?? ''}`}>{children}</div>
    );
}
