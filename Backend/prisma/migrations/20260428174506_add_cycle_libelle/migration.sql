/*
  Warnings:

  - Added the required column `libelle` to the `Cycles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Cycles" ADD COLUMN     "libelle" TEXT NOT NULL;
