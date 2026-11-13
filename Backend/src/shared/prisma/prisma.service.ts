import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

// Depuis Prisma 7, le client n'embarque plus de moteur binaire (Rust) : il
// parle à PostgreSQL à travers le pilote Node `pg`, branché par un « adaptateur ».
// L'URL de connexion n'est plus lue dans schema.prisma : on la passe ici.
@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    constructor() {
        const connectionString = process.env['DATABASE_URL'];
        // Échec immédiat et explicite au démarrage plutôt qu'à la première requête.
        if (!connectionString) {
            throw new Error(
                'DATABASE_URL est requise pour se connecter à PostgreSQL',
            );
        }
        super({ adapter: new PrismaPg({ connectionString }) });
    }

    // Ouvre la connexion au démarrage du module : une base injoignable fait
    // échouer le démarrage de l'API au lieu de la première requête.
    async onModuleInit(): Promise<void> {
        await this.$connect();
    }

    // Ferme proprement le pool `pg` à l'arrêt de l'application (et des tests
    // d'intégration), sinon Node garde des connexions ouvertes.
    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}
