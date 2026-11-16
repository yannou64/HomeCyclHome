import axios from 'axios';

/**
 * Extrait le message d'erreur renvoyé par l'API, ou retourne `fallback`.
 *
 * Le backend NestJS renvoie `{ message }` dans le corps de l'erreur :
 * - une chaîne pour une exception métier (`ConflictException('…')`) ;
 * - un tableau de chaînes pour une erreur de validation (ValidationPipe) :
 *   on affiche alors le premier message.
 *
 * À utiliser dans le `catch` d'un gestionnaire de formulaire :
 *   setError(getApiErrorMessage(err, 'Une erreur est survenue.'));
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
    // isAxiosError vérifie la forme de l'erreur : pas besoin de « as » forcé.
    if (!axios.isAxiosError<{ message?: string | string[] }>(err)) {
        return fallback;
    }
    const message = err.response?.data?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.length > 0) return message[0];
    return fallback;
}
