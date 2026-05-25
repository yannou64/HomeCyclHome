-- CreateTable
CREATE TABLE "ModelesPlanification" (
    "id" TEXT NOT NULL,
    "jour_semaine" INTEGER NOT NULL,
    "heure_debut" INTEGER NOT NULL,
    "heure_fin" INTEGER NOT NULL,
    "intervalle_minutes" INTEGER NOT NULL,
    "is_actif" BOOLEAN NOT NULL DEFAULT true,
    "date_debut_validite" TIMESTAMP(3) NOT NULL,
    "date_fin_validite" TIMESTAMP(3),
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicien_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,

    CONSTRAINT "ModelesPlanification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PausesRecurrentes" (
    "id" TEXT NOT NULL,
    "jour_semaine" INTEGER,
    "heure_debut" INTEGER NOT NULL,
    "heure_fin" INTEGER NOT NULL,
    "description" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicien_id" TEXT NOT NULL,

    CONSTRAINT "PausesRecurrentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indisponibilites" (
    "id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "motif" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicien_id" TEXT NOT NULL,

    CONSTRAINT "Indisponibilites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creneaux" (
    "id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "is_disponible" BOOLEAN NOT NULL DEFAULT true,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modele_planification_id" TEXT,
    "zone_id" TEXT NOT NULL,

    CONSTRAINT "Creneaux_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModelesPlanification" ADD CONSTRAINT "ModelesPlanification_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelesPlanification" ADD CONSTRAINT "ModelesPlanification_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PausesRecurrentes" ADD CONSTRAINT "PausesRecurrentes_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indisponibilites" ADD CONSTRAINT "Indisponibilites_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneaux" ADD CONSTRAINT "Creneaux_modele_planification_id_fkey" FOREIGN KEY ("modele_planification_id") REFERENCES "ModelesPlanification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneaux" ADD CONSTRAINT "Creneaux_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
