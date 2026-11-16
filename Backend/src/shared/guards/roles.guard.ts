import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/user-role';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Lit les rôles déposés par @Roles() : d'abord sur la méthode appelée,
        // sinon sur sa classe (controller). Un @Roles posé sur le controller
        // protège donc toutes ses routes, y compris celles ajoutées plus tard ;
        // un @Roles posé sur une méthode prime sur celui de la classe.
        const requiredRoles = this.reflector.getAllAndOverride<
            UserRole[] | undefined
        >(ROLES_KEY, [context.getHandler(), context.getClass()]);

        // Pas de @Roles → ouvert à tout utilisateur authentifié
        if (!requiredRoles) return true;

        // JwtAuthGuard a déjà peuplé request.user avec { userId, role }
        const { user } = context
            .switchToHttp()
            .getRequest<{ user: { role: UserRole } }>();
        return requiredRoles.includes(user.role);
    }
}
