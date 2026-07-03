-- CreateEnum
CREATE TYPE "ContextePhoto" AS ENUM ('client', 'technicien');

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

-- AddForeignKey
ALTER TABLE "Photos" ADD CONSTRAINT "Photos_intervention_id_fkey" FOREIGN KEY ("intervention_id") REFERENCES "Interventions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
