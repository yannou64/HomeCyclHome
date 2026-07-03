import type { ReactNode, FormEvent } from 'react';

type FormProps = {
    children: ReactNode;
    onSubmit: () => void;
    className?: string;
};

// Centralise le e.preventDefault() + onSubmit — garantit la soumission au clavier
// (touche Entrée) partout où un CTAButton type="submit" est utilisé.
export function Form({ children, onSubmit, className }: FormProps) {
    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        onSubmit();
    }

    return (
        <form className={className} onSubmit={handleSubmit}>
            {children}
        </form>
    );
}