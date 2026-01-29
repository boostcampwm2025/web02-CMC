/*
  Warnings:

  - You are about to drop the column `password` on the `battles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[invite_code]` on the table `battles` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "battles" DROP COLUMN "password",
ADD COLUMN     "invite_code" VARCHAR(255),
ALTER COLUMN "is_private" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "battles_invite_code_key" ON "battles"("invite_code");
