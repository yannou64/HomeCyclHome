import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilitaire shadcn : fusionne les classes Tailwind sans conflits
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
