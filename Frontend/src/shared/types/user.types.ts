import { type Role } from '../../app/providers/authContext/types/auth.types';

export type User = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    is_actif: boolean;
    date_creation: Date;
    date_maj: Date;
    date_dernier_login: Date | null;
    role: Role;
};
