import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

// Helper : fabrique un faux contexte HTTP avec le rôle donné
const mockContext = (role: string): ExecutionContext =>
    ({
        getHandler: () => ({}),
        switchToHttp: () => ({
            getRequest: () => ({ user: { role } }),
        }),
    }) as unknown as ExecutionContext;

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    it('devrait autoriser quand aucun rôle requis (pas de @Roles)', () => {
        // Simule une route sans décorateur @Roles → reflector retourne undefined
        jest.spyOn(reflector, 'get').mockReturnValue(undefined);
        expect(guard.canActivate(mockContext('client'))).toBe(true);
    });

    it('devrait autoriser un admin sur une route @Roles(admin)', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
        expect(guard.canActivate(mockContext('admin'))).toBe(true);
    });

    it('devrait refuser un client sur une route @Roles(admin)', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
        expect(guard.canActivate(mockContext('client'))).toBe(false);
    });

    it('devrait refuser un technicien sur une route @Roles(admin)', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
        expect(guard.canActivate(mockContext('technicien'))).toBe(false);
    });

    it('devrait autoriser plusieurs rôles si la route les accepte tous', () => {
        jest.spyOn(reflector, 'get').mockReturnValue(['admin', 'technicien']);
        expect(guard.canActivate(mockContext('technicien'))).toBe(true);
        expect(guard.canActivate(mockContext('admin'))).toBe(true);
        expect(guard.canActivate(mockContext('client'))).toBe(false);
    });
});
