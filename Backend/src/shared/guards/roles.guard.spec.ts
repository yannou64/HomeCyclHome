import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';
import type { UserRole } from '../types/user-role';
import { RolesGuard } from './roles.guard';

// De vrais controllers décorés : le guard lit les métadonnées avec le vrai
// Reflector, comme en production. (L'ancienne version simulait reflector.get
// et ne voyait pas que @Roles posé sur la classe était ignoré.)

@Roles('admin')
class ControllerAdmin {
    lister(): void {}
}

@Roles('admin')
class ControllerAdminAvecException {
    @Roles('admin', 'technicien')
    consulter(): void {}
}

class ControllerSansRole {
    @Roles('admin')
    supprimer(): void {}

    profil(): void {}
}

// Faux contexte HTTP : la route appelée (classe + méthode) et le rôle connecté
const contexte = (
    classe: new () => object,
    methode: string,
    role: UserRole,
): ExecutionContext =>
    ({
        getClass: () => classe,
        getHandler: () =>
            (classe.prototype as Record<string, unknown>)[methode],
        switchToHttp: () => ({
            getRequest: () => ({ user: { role } }),
        }),
    }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
    let guard: RolesGuard;

    beforeEach(() => {
        guard = new RolesGuard(new Reflector());
    });

    it('applique @Roles posé sur la classe à toutes ses méthodes', () => {
        expect(
            guard.canActivate(contexte(ControllerAdmin, 'lister', 'client')),
        ).toBe(false);
        expect(
            guard.canActivate(
                contexte(ControllerAdmin, 'lister', 'technicien'),
            ),
        ).toBe(false);
        expect(
            guard.canActivate(contexte(ControllerAdmin, 'lister', 'admin')),
        ).toBe(true);
    });

    it('applique @Roles posé sur la méthode', () => {
        expect(
            guard.canActivate(
                contexte(ControllerSansRole, 'supprimer', 'client'),
            ),
        ).toBe(false);
        expect(
            guard.canActivate(
                contexte(ControllerSansRole, 'supprimer', 'admin'),
            ),
        ).toBe(true);
    });

    it('fait primer @Roles de la méthode sur celui de la classe', () => {
        const consulter = (role: UserRole) =>
            guard.canActivate(
                contexte(ControllerAdminAvecException, 'consulter', role),
            );
        expect(consulter('technicien')).toBe(true);
        expect(consulter('admin')).toBe(true);
        expect(consulter('client')).toBe(false);
    });

    it('autorise tout utilisateur connecté quand ni la classe ni la méthode ne portent @Roles', () => {
        expect(
            guard.canActivate(contexte(ControllerSansRole, 'profil', 'client')),
        ).toBe(true);
    });
});
