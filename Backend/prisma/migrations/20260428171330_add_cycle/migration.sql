-- CreateTable
CREATE TABLE "Cycles" (
    "id" TEXT NOT NULL,
    "particularite" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" TEXT NOT NULL,
    "marque_id" TEXT NOT NULL,
    "type_cycle_id" TEXT NOT NULL,

    CONSTRAINT "Cycles_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cycles" ADD CONSTRAINT "Cycles_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycles" ADD CONSTRAINT "Cycles_marque_id_fkey" FOREIGN KEY ("marque_id") REFERENCES "Marques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cycles" ADD CONSTRAINT "Cycles_type_cycle_id_fkey" FOREIGN KEY ("type_cycle_id") REFERENCES "TypesCycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
