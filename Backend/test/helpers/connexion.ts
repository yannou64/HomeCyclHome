import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import type { UtilisateurDeTest } from './fabriques';

/**
 * Connecte un utilisateur par la vraie route POST /api/auth/login et renvoie
 * ses cookies de session, à passer aux requêtes suivantes :
 *   request(app.getHttpServer()).get('/api/…').set('Cookie', cookies)
 */
export async function seConnecter(
    app: INestApplication,
    utilisateur: UtilisateurDeTest,
): Promise<string[]> {
    const reponse = await request(app.getHttpServer() as Server)
        .post('/api/auth/login')
        .send({ email: utilisateur.email, password: utilisateur.motDePasse })
        .expect(200);
    const cookies = reponse.get('Set-Cookie');
    if (!cookies) throw new Error('Connexion de test : aucun cookie reçu.');
    return cookies;
}
