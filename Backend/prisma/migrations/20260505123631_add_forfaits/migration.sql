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

-- CreateIndex
CREATE UNIQUE INDEX "Forfaits_nom_key" ON "Forfaits"("nom");

-- AddForeignKey
ALTER TABLE "HistoriquePrixForfaits" ADD CONSTRAINT "HistoriquePrixForfaits_forfait_id_fkey" FOREIGN KEY ("forfait_id") REFERENCES "Forfaits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
