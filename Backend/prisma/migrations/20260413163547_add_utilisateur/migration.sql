-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'technicien', 'admin');

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

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateurs_email_key" ON "Utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateurs_email_confirmation_token_key" ON "Utilisateurs"("email_confirmation_token");
