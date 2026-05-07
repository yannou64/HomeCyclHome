-- CreateTable
CREATE TABLE "TechnicienZones" (
    "technicien_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "date_affectation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TechnicienZones_pkey" PRIMARY KEY ("technicien_id","zone_id")
);

-- AddForeignKey
ALTER TABLE "TechnicienZones" ADD CONSTRAINT "TechnicienZones_technicien_id_fkey" FOREIGN KEY ("technicien_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechnicienZones" ADD CONSTRAINT "TechnicienZones_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
