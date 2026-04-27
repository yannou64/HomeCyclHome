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

-- CreateIndex
CREATE UNIQUE INDEX "Marques_libelle_key" ON "Marques"("libelle");

-- CreateIndex
CREATE UNIQUE INDEX "TypesCycles_libelle_key" ON "TypesCycles"("libelle");
