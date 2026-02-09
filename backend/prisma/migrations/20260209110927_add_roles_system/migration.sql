/*
  Warnings:

  - You are about to drop the `cardio_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exercises` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `muscu_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `weight_entries` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cardio_activities" DROP CONSTRAINT "cardio_activities_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "cardio_activities" DROP CONSTRAINT "cardio_activities_userId_fkey";

-- DropForeignKey
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_userId_fkey";

-- DropForeignKey
ALTER TABLE "muscu_activities" DROP CONSTRAINT "muscu_activities_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "muscu_activities" DROP CONSTRAINT "muscu_activities_userId_fkey";

-- DropForeignKey
ALTER TABLE "weight_entries" DROP CONSTRAINT "weight_entries_userId_fkey";

-- DropTable
DROP TABLE "cardio_activities";

-- DropTable
DROP TABLE "exercises";

-- DropTable
DROP TABLE "muscu_activities";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "weight_entries";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "role" TEXT NOT NULL DEFAULT 'user',
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardioActivity" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardioActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MuscuActivity" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calories" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MuscuActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightEntry" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "muscleMass" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_userId_name_type_key" ON "Exercise"("userId", "name", "type");

-- CreateIndex
CREATE INDEX "CardioActivity_userId_date_idx" ON "CardioActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "MuscuActivity_userId_date_idx" ON "MuscuActivity"("userId", "date");

-- CreateIndex
CREATE INDEX "WeightEntry_userId_date_idx" ON "WeightEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardioActivity" ADD CONSTRAINT "CardioActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardioActivity" ADD CONSTRAINT "CardioActivity_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscuActivity" ADD CONSTRAINT "MuscuActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MuscuActivity" ADD CONSTRAINT "MuscuActivity_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightEntry" ADD CONSTRAINT "WeightEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
