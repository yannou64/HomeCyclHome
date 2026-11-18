-- Règles d'un bloc horaire posées dans la base (RG4 d'« Administrer les modèles
-- de planification 2.0 ») : défense en profondeur, le DTO les contrôle déjà.
-- Elles servent aussi à prouver la transaction « tout ou rien » de la création
-- d'un modèle (CA18) : un bloc invalide fait échouer l'écriture et annule tout.
--
-- debut et fin sont en minutes depuis minuit : 420 = 7h00, 1200 = 20h00.
-- Prisma ne sait pas décrire une contrainte CHECK dans schema.prisma : elle vit
-- seulement ici, en SQL.
ALTER TABLE "BlocsHoraires"
    ADD CONSTRAINT "BlocsHoraires_regles_check" CHECK (
        "debut" >= 420
        AND "fin" <= 1200
        AND "fin" > "debut"
        AND "debut" % 30 = 0
        AND "fin" % 30 = 0
    );
