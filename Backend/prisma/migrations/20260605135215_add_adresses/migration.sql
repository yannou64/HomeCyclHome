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

-- CreateIndex
CREATE UNIQUE INDEX "Adresses_google_place_id_key" ON "Adresses"("google_place_id");

-- AddForeignKey
ALTER TABLE "PeutSeSituer" ADD CONSTRAINT "PeutSeSituer_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeutSeSituer" ADD CONSTRAINT "PeutSeSituer_adresse_id_fkey" FOREIGN KEY ("adresse_id") REFERENCES "Adresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
