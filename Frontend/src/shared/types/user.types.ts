import { type Role } from '../../app/providers/authContext/types/auth.types';

export type User = {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    is_actif: boolean;
    date_creation: Date;
    date_maj: Date;
    dernier_login: Date;
    role: Role;
};
