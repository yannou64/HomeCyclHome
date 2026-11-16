import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/user-role';

export const ROLES_KEY = 'roles';

// Dépose les rôles requis comme métadonnée sur la route décorée
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
