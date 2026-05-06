-- CreateTable
CREATE TABLE "Zones" (
    "id" TEXT NOT NULL,
    "nom_zone" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
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

-- CreateIndex
CREATE UNIQUE INDEX "Zones_nom_zone_key" ON "Zones"("nom_zone");

-- AddForeignKey
ALTER TABLE "ZonesPoints" ADD CONSTRAINT "ZonesPoints_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "Zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;
