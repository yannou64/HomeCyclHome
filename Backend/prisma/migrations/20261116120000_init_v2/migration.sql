-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'technicien', 'admin');

-- CreateEnum
CREATE TYPE "StatutIntervention" AS ENUM ('Planifiee', 'Realisee', 'Annulee', 'EnConflit');

-- CreateEnum
CREATE TYPE "StatutCreneau" AS ENUM ('Libre', 'InterventionReservee', 'Deplacement');

-- CreateEnum
CREATE TYPE "CouleurZone" AS ENUM ('Rouge', 'Orange', 'Jaune', 'Lime', 'Vert', 'Turquoise', 'Cyan', 'Bleu', 'Indigo', 'Violet', 'Prune', 'Rose');

-- CreateEnum
CREATE TYPE "ContextePhoto" AS ENUM ('client', 'technicien');

-- CreateTable
CREATE TABLE "Utilisateurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'client',
    "is_actif" BOOLEAN NOT NULL DEFAULT false,
    "email_confirmation_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "refresh_token_hash" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,
    "date_dernier_login" TIMESTAMP(3),

    CONSTRAINT "Utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adresses" (
    "id" TEXT NOT NULL,
    "numero" TEXT,
    "rue" TEXT NOT NULL,
    "code_postal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "pays" TEXT NOT NULL DEFAULT 'France',
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "google_place_id" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Adresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeutSeSituer" (
    "id" TEXT NOT NULL,
    "titre_description" TEXT,
    "adresse_principal" BOOLEAN NOT NULL DEFAULT false,
    "is_valide" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_invalidite" TIMESTAMP(3),
    "utilisateur_id" TEXT NOT NULL,
    "adresse_id" TEXT NOT NULL,

    CONSTRAINT "PeutSeSituer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marques" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "Marques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypesCycles" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,

    CONSTRAINT "TypesCycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cycles" (
    "id" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "particularite" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" TEXT NOT NULL,
    "marque_id" TEXT NOT NULL,
    "type_cycle_id" TEXT NOT NULL,

    CONSTRAINT "Cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forfaits" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "duree_minutes" INTEGER NOT NULL,
    "is_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Forfaits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriquePrixForfaits" (
    "id" TEXT NOT NULL,
    "montant" DECIMAL(10,2) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "forfait_id" TEXT NOT NULL,

    CONSTRAINT "HistoriquePrixForfaits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zones" (
    "id" TEXT NOT NULL,
    "nom_zone" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "couleur" "CouleurZone" NOT NULL DEFAULT 'Rouge',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZonesPoints" (
    "id" TEXT NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "ordre" INTEGER NOT NULL,
    "zone_id" TEXT NOT NULL,

    CONSTRAINT "ZonesPoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechnicienZones" (
    "technicien_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "date_affectation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechnicienZones_pkey" PRIMARY KEY ("technicien_id","zone_id")
);

-- CreateTable
CREATE TABLE "ModelesPlanification" (
    "id" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "lundi" BOOLEAN NOT NULL DEFAULT false,
    "mardi" BOOLEAN NOT NULL DEFAULT false,
    "mercredi" BOOLEAN NOT NULL DEFAULT false,
    "jeudi" BOOLEAN NOT NULL DEFAULT false,
    "vendredi" BOOLEAN NOT NULL DEFAULT false,
    "samedi" BOOLEAN NOT NULL DEFAULT false,
    "dimanche" BOOLEAN NOT NULL DEFAULT false,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicien_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,

    CONSTRAINT "ModelesPlanification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlocsHoraires" (
    "id" TEXT NOT NULL,
    "debut" INTEGER NOT NULL,
    "fin" INTEGER NOT NULL,
    "modele_planification_id" TEXT NOT NULL,

    CONSTRAINT "BlocsHoraires_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creneaux" (
    "id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "statut" "StatutCreneau" NOT NULL DEFAULT 'Libre',
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicien_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "intervention_id" TEXT,

    CONSTRAINT "Creneaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interventions" (
    "id" TEXT NOT NULL,
    "statut" "StatutIntervention" NOT NULL DEFAULT 'Planifiee',
    "commentaire_client" TEXT,
    "commentaire_technicien" TEXT,
    "duree_minutes_snapshot" INTEGER NOT NULL,
    "date_prevue" TIMESTAMP(3) NOT NULL,
    "date_cloture" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,
    "client_id" TEXT NOT NULL,
    "technicien_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "adresse_id" TEXT NOT NULL,
    "historique_prix_forfait_id" TEXT NOT NULL,

    CONSTRAINT "Interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiements" (
    "id" TEXT NOT NULL,
    "montant_total" DECIMAL(10,2) NOT NULL,
    "date_paiement" TIMESTAMP(3) NOT NULL,
    "mode_paiement" TEXT NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intervention_id" TEXT NOT NULL,

    CONSTRAINT "Paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photos" (
    "id" TEXT NOT NULL,
    "url_s3" TEXT NOT NULL,
    "cle_s3" TEXT NOT NULL,
    "contexte" "ContextePhoto" NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intervention_id" TEXT NOT NULL,

    CONSTRAINT "Photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateurs_email_key" ON "Utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateurs_email_confirmation_token_key" ON "Utilisateurs"("email_confirmation_token");

-- CreateIndex
CREATE UNIQUE INDEX "Adresses_google_place_id_key" ON "Adresses"("google_place_id");

-- CreateIndex
CREATE UNIQUE INDEX "Marques_libelle_key" ON "Marques"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "TypesCycles_libelle_key" ON "TypesCycles"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "Forfaits_nom_key" ON "Forfaits"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Zones_nom_zone_key" ON "Zones"("nom_zone");

-- CreateIndex
CREATE UNIQUE INDEX "Creneaux_technicien_id_date_debut_key" ON "Creneaux"("technicien_id", "date_debut");

-- CreateIndex
CREATE UNIQUE INDEX "Paiements_intervention_id_key" ON "Paiements"("intervention_id");

-- AddForeignKey
ALTER TABLE "PeutSeSituer" ADD CONSTRAINT "PeutSeSituer_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeutSeSituer" ADD CONSTRAINT "PeutSeSituer_adresse_id_fkey" FOREIGN KEY ("adresse_id") REFERENCES "Adresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycles" ADD CONSTRAINT "Cycles_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycles" ADD CONSTRAINT "Cycles_marque_id_fkey" FOREIGN KEY ("marque_id") REFERENCES "Marques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycles" ADD CONSTRAINT "Cycles_type_cycle_id_fkey" FOREIGN KEY ("type_cycle_id") REFERENCES "TypesCycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriquePrixForfaits" ADD CONSTRAINT "HistoriquePrixForfaits_forfait_id_fkey" FOREIGN KEY ("forfait_id") REFERENCES "Forfaits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZonesPoints" ADD CONSTRAINT "ZonesPoints_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicienZones" ADD CONSTRAINT "TechnicienZones_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicienZones" ADD CONSTRAINT "TechnicienZones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelesPlanification" ADD CONSTRAINT "ModelesPlanification_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelesPlanification" ADD CONSTRAINT "ModelesPlanification_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlocsHoraires" ADD CONSTRAINT "BlocsHoraires_modele_planification_id_fkey" FOREIGN KEY ("modele_planification_id") REFERENCES "ModelesPlanification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneaux" ADD CONSTRAINT "Creneaux_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneaux" ADD CONSTRAINT "Creneaux_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneaux" ADD CONSTRAINT "Creneaux_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "Interventions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_adresse_id_fkey" FOREIGN KEY ("adresse_id") REFERENCES "Adresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_historique_prix_forfait_id_fkey" FOREIGN KEY ("historique_prix_forfait_id") REFERENCES "HistoriquePrixForfaits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiements" ADD CONSTRAINT "Paiements_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "Interventions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "Interventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

