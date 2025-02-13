/*
  Warnings:

  - You are about to drop the column `moneyRoleId` on the `Bet` table. All the data in the column will be lost.
  - You are about to drop the `MoneyRole` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bet" DROP CONSTRAINT "Bet_moneyRoleId_fkey";

-- DropForeignKey
ALTER TABLE "MoneyRole" DROP CONSTRAINT "MoneyRole_userId_fkey";

-- AlterTable
ALTER TABLE "Bet" DROP COLUMN "moneyRoleId",
ADD COLUMN     "moneyRollId" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'user';

-- DropTable
DROP TABLE "MoneyRole";

-- CreateTable
CREATE TABLE "MoneyRoll" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MoneyRoll_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MoneyRoll" ADD CONSTRAINT "MoneyRoll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_moneyRollId_fkey" FOREIGN KEY ("moneyRollId") REFERENCES "MoneyRoll"("id") ON DELETE SET NULL ON UPDATE CASCADE;
