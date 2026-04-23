import type { Role } from '../../../app/providers/authContext/types/auth.types';

export type UserProfile = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    role: Role;
};

export type UpdateProfilePayload = {
    nom?: string;
    prenom?: string;
    telephone?: string;
};
