import { chargerEnvTest } from './charger-env-test';

// Exécuté avant chaque fichier de test, AVANT ses imports : jwt.config.ts et
// PrismaService lisent process.env dès leur chargement.
chargerEnvTest();
