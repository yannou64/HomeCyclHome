import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../features/users/dto/user-profile.dto';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Lit les rôles déposés par @Roles() sur le handler de la route
        const requiredRoles = this.reflector.get<UserRole[]>(
            ROLES_KEY,
            context.getHandler(),
        );

        // Pas de @Roles → ouvert à tout utilisateur authentifié
        if (!requiredRoles) return true;

        // JwtAuthGuard a déjà peuplé request.user avec { userId, role }
        const { user } = context
            .switchToHttp()
            .getRequest<{ user: { role: UserRole } }>();
        return requiredRoles.includes(user.role);
    }
}
