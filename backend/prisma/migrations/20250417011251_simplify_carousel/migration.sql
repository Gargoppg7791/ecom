/*
  Warnings:

  - You are about to drop the column `description` on the `Carousel` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Carousel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Carousel" DROP COLUMN "description",
DROP COLUMN "order";
