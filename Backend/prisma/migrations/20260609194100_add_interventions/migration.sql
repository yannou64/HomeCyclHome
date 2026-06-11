-- CreateEnum
CREATE TYPE "StatutIntervention" AS ENUM ('Planifiee', 'Terminee', 'Annulee');

-- CreateTable
CREATE TABLE "Interventions" (
    "id" TEXT NOT NULL,
    "statut" "StatutIntervention" NOT NULL DEFAULT 'Planifiee',
    "commentaire" TEXT,
    "duree_minutes_snapshot" INTEGER NOT NULL,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_maj" TIMESTAMP(3) NOT NULL,
    "client_id" TEXT NOT NULL,
    "cycle_id" TEXT NOT NULL,
    "forfait_id" TEXT NOT NULL,
    "creneau_id" TEXT NOT NULL,
    "adresse_id" TEXT NOT NULL,
    "historique_prix_forfait_id" TEXT NOT NULL,
    "technicien_id" TEXT,

    CONSTRAINT "Interventions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Interventions_creneau_id_key" ON "Interventions"("creneau_id");

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "Cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_forfait_id_fkey" FOREIGN KEY ("forfait_id") REFERENCES "Forfaits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_creneau_id_fkey" FOREIGN KEY ("creneau_id") REFERENCES "Creneaux"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_adresse_id_fkey" FOREIGN KEY ("adresse_id") REFERENCES "Adresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interventions" ADD CONSTRAINT "Interventions_historique_prix_forfait_id_fkey" FOREIGN KEY ("historique_prix_forfait_id") REFERENCES "HistoriquePrixForfaits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
