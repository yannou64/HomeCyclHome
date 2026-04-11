import styles from './CTAButton.module.scss';
import type { ReactNode } from 'react';

type ButtonProps = {
    children: ReactNode;
    type?: 'submit' | 'button' | 'reset';
    disabled?: boolean;
    isLoading?: boolean;
    className?: string;
    onClick?: () => void;
};

export function CTAButton({
    children,
    type = 'button',
    disabled = false,
    isLoading = false,
    className,
    onClick,
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`${styles.button} ${className ?? ''}`}
            disabled={disabled || isLoading}
            onClick={onClick}
        >
            {isLoading ? 'Chargement...' : children}
        </button>
    );
}
