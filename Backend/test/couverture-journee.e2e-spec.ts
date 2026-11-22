import type { Server } from 'http';
import request from 'supertest';
import {
    creerApplicationDeTest,
    ApplicationDeTest,
} from './helpers/application';
import { viderLaBase } from './helpers/base';
import { creerCreneau, creerUtilisateur, creerZone } from './helpers/fabriques';
import { seConnecter } from './helpers/connexion';
import { StatutCreneau } from '../src/generated/prisma/client';

// Journée pivot : le 10/06/2026. En juin, Paris est à UTC+2 : 8h00 à Paris =
// 06h00 UTC. `aParis('08:00')` écrit l'instant UTC d'une heure du 10/06.
const DATE = '2026-06-10';
const aParis = (heure: string, jour = DATE) =>
    new Date(new Date(`${jour}T${heure}:00.000+02:00`).toISOString());

type CarteTechnicien = {
    id: string;
    zone: { id: string; couleur: string; isActive: boolean } | null;
    creneaux: { debut: number; statut: string }[];
    planifieJusquau: string | null;
};
type CarteZone = {
    id: string;
    isActive: boolean;
    etat: string;
    tranchesLibres: number[];
    derniereCouverture: string | null;
};
type Journee = { techniciens: CarteTechnicien[]; zones: CarteZone[] };

describe('US-02 Consulter la journée des techniciens et les disponibilités des zones 2.0', () => {
    let t: ApplicationDeTest;
    let serveur: Server;

    beforeAll(async () => {
        t = await creerApplicationDeTest();
        serveur = t.app.getHttpServer() as Server;
    });

    beforeEach(async () => {
        await viderLaBase(t.prisma);
    });

    afterAll(async () => {
        await t.app.close();
    });

    /** Un admin connecté. */
    async function seConnecterAdmin() {
        return seConnecter(t.app, await creerUtilisateur(t.prisma, 'admin'));
    }

    /** Demande la journée et la renvoie. */
    async function journee(cookies: string[], date = DATE): Promise<Journee> {
        const reponse = await request(serveur)
            .get('/api/admin/planning/journee')
            .query({ date })
            .set('Cookie', cookies)
            .expect(200);
        return reponse.body as Journee;
    }

    const carteTechnicien = (j: Journee, id: string) =>
        j.techniciens.find((c) => c.id === id);
    const carteZone = (j: Journee, id: string) =>
        j.zones.find((c) => c.id === id);

    /** Un créneau du technicien dans la zone, à l'instant donné. */
    function creneau(
        technicienId: string,
        zoneId: string,
        dateDebut: Date,
        statut: StatutCreneau = StatutCreneau.Libre,
    ) {
        return creerCreneau(t.prisma, {
            technicienId,
            zoneId,
            dateDebut,
            statut,
        });
    }

    it('CA01 — refuse l’accès à un utilisateur sans le rôle admin [RG1]', async () => {
        for (const role of ['client', 'technicien'] as const) {
            const cookies = await seConnecter(
                t.app,
                await creerUtilisateur(t.prisma, role),
            );
            await request(serveur)
                .get('/api/admin/planning/journee')
                .query({ date: DATE })
                .set('Cookie', cookies)
                .expect(403);
        }
    });

    it('CA02 — affiche une carte par technicien, y compris sans créneau ce jour-là [RG8]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const avecCreneau = await creerUtilisateur(t.prisma, 'technicien');
        const sansCreneau = await creerUtilisateur(t.prisma, 'technicien');
        await creneau(avecCreneau.id, zone.id, aParis('08:00'));

        // Écart du 22/11/2026 : un technicien désactivé n'a de carte que s'il
        // a des créneaux ce jour-là
        const desactiveAvec = await creerUtilisateur(t.prisma, 'technicien');
        const desactiveSans = await creerUtilisateur(t.prisma, 'technicien');
        await t.prisma.utilisateur.updateMany({
            where: { id: { in: [desactiveAvec.id, desactiveSans.id] } },
            data: { is_actif: false },
        });
        await creneau(desactiveAvec.id, zone.id, aParis('09:00'));

        const j = await journee(cookies);

        expect(j.techniciens.map((c) => c.id).sort()).toEqual(
            [avecCreneau.id, sansCreneau.id, desactiveAvec.id].sort(),
        );
    });

    it('CA03 — montre la zone du jour et les créneaux de 30 min d’un technicien [RG8]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma, { couleur: 'Bleu' });
        const tech = await creerUtilisateur(t.prisma, 'technicien');
        // Écrits dans le désordre : la carte les range par heure
        await creneau(
            tech.id,
            zone.id,
            aParis('08:30'),
            StatutCreneau.Deplacement,
        );
        await creneau(tech.id, zone.id, aParis('08:00'));
        await creneau(
            tech.id,
            zone.id,
            aParis('09:00'),
            StatutCreneau.InterventionReservee,
        );

        const carte = carteTechnicien(await journee(cookies), tech.id);

        expect(carte?.zone).toMatchObject({
            id: zone.id,
            couleur: 'Bleu',
            isActive: true,
        });
        // Minutes d'horloge à Paris : 8h00 = 480
        expect(carte?.creneaux).toEqual([
            { debut: 480, statut: 'Libre' },
            { debut: 510, statut: 'Deplacement' },
            { debut: 540, statut: 'InterventionReservee' },
        ]);
    });

    it('CA06 — n’affiche ni zone ni créneau pour un technicien sans créneau ce jour-là [RG8]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const tech = await creerUtilisateur(t.prisma, 'technicien');
        // Un créneau la veille, pas le jour pivot
        await creneau(tech.id, zone.id, aParis('08:00', '2026-06-09'));

        const carte = carteTechnicien(await journee(cookies), tech.id);

        expect(carte?.zone).toBeNull();
        expect(carte?.creneaux).toEqual([]);
    });

    it('CA07 — « planifié jusqu’au » vaut la date du dernier créneau du technicien [RG5]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const tech = await creerUtilisateur(t.prisma, 'technicien');
        await creneau(tech.id, zone.id, aParis('08:00'));
        await creneau(tech.id, zone.id, aParis('10:00', '2026-06-20'));
        // Dernier créneau : 21/06 à 0h30 à Paris, encore le 20/06 en UTC
        await creneau(tech.id, zone.id, aParis('00:30', '2026-06-21'));

        const carte = carteTechnicien(await journee(cookies), tech.id);

        expect(carte?.planifieJusquau).toBe('2026-06-21');
    });

    it('CA08 — indique « non planifié » pour un technicien sans aucun créneau [RG5]', async () => {
        const cookies = await seConnecterAdmin();
        const tech = await creerUtilisateur(t.prisma, 'technicien');

        const carte = carteTechnicien(await journee(cookies), tech.id);

        expect(carte?.planifieJusquau).toBeNull();
    });

    it('CA09 — « dernière couverture le » vaut le dernier jour où la zone a un créneau, tous techniciens confondus [RG6]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const techA = await creerUtilisateur(t.prisma, 'technicien');
        const techB = await creerUtilisateur(t.prisma, 'technicien');
        await creneau(techA.id, zone.id, aParis('08:00', '2026-06-15'));
        // Le dernier créneau de la zone est celui de B : 1er/07 à 0h30 à
        // Paris, encore le 30/06 en UTC
        await creneau(techB.id, zone.id, aParis('00:30', '2026-07-01'));

        const carte = carteZone(await journee(cookies), zone.id);

        expect(carte?.derniereCouverture).toBe('2026-07-01');
    });

    it('CA10 — indique « aucune couverture » pour une zone qui n’a jamais eu de créneau [RG6]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);

        const carte = carteZone(await journee(cookies), zone.id);

        expect(carte?.derniereCouverture).toBeNull();
    });

    it('CA12 — une tranche est disponible dès qu’un technicien de la zone y a un créneau Libre, sans compter les techniciens [RG9]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const techA = await creerUtilisateur(t.prisma, 'technicien');
        const techB = await creerUtilisateur(t.prisma, 'technicien');
        // 8h00 : deux techniciens libres → une seule tranche, sans nombre
        await creneau(techA.id, zone.id, aParis('08:00'));
        await creneau(techB.id, zone.id, aParis('08:00'));
        await creneau(techB.id, zone.id, aParis('09:00'));

        const carte = carteZone(await journee(cookies), zone.id);

        expect(carte?.etat).toBe('disponible');
        expect(carte?.tranchesLibres).toEqual([480, 540]);
        // Aucun compte des techniciens dans la carte (RG9)
        expect(Object.keys(carte ?? {}).sort()).toEqual(
            [
                'couleur',
                'derniereCouverture',
                'etat',
                'id',
                'isActive',
                'nomZone',
                'tranchesLibres',
            ].sort(),
        );
    });

    it('CA13 — les créneaux Déplacement et Intervention réservée ne rendent pas une tranche disponible [RG9]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const tech = await creerUtilisateur(t.prisma, 'technicien');
        await creneau(
            tech.id,
            zone.id,
            aParis('10:00'),
            StatutCreneau.Deplacement,
        );
        await creneau(
            tech.id,
            zone.id,
            aParis('10:30'),
            StatutCreneau.InterventionReservee,
        );
        await creneau(tech.id, zone.id, aParis('11:00'));

        const carte = carteZone(await journee(cookies), zone.id);

        expect(carte?.tranchesLibres).toEqual([660]);
    });

    it('CA14 — indique « complet » pour une zone qui a des créneaux ce jour-là mais aucun Libre [RG9]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const tech = await creerUtilisateur(t.prisma, 'technicien');
        await creneau(
            tech.id,
            zone.id,
            aParis('10:00'),
            StatutCreneau.Deplacement,
        );
        await creneau(
            tech.id,
            zone.id,
            aParis('10:30'),
            StatutCreneau.InterventionReservee,
        );

        const carte = carteZone(await journee(cookies), zone.id);

        expect(carte?.etat).toBe('complet');
        expect(carte?.tranchesLibres).toEqual([]);
    });

    it('CA15 — indique « non couverte » pour une zone sans aucun créneau ce jour-là [RG9]', async () => {
        const cookies = await seConnecterAdmin();
        const zone = await creerZone(t.prisma);
        const tech = await creerUtilisateur(t.prisma, 'technicien');
        // Couverte le lendemain, pas le jour pivot
        await creneau(tech.id, zone.id, aParis('08:00', '2026-06-11'));

        const carte = carteZone(await journee(cookies), zone.id);

        expect(carte?.etat).toBe('non couverte');
        expect(carte?.tranchesLibres).toEqual([]);
    });

    it('CA16 — garde la carte d’une zone inactive qui a des créneaux ce jour-là [RG10, RG11]', async () => {
        const cookies = await seConnecterAdmin();
        const tech = await creerUtilisateur(t.prisma, 'technicien');
        const inactiveAvec = await creerZone(t.prisma, {
            couleur: 'Vert',
            isActive: false,
        });
        const inactiveSans = await creerZone(t.prisma, { isActive: false });
        await creneau(tech.id, inactiveAvec.id, aParis('08:00'));

        const j = await journee(cookies);

        // Présente, marquée inactive : l'interface l'affiche en gris clair
        expect(carteZone(j, inactiveAvec.id)).toMatchObject({
            isActive: false,
            couleur: 'Vert',
        });
        // Écart du 22/11/2026 : sans créneau ce jour-là, pas de carte
        expect(carteZone(j, inactiveSans.id)).toBeUndefined();
    });
});
