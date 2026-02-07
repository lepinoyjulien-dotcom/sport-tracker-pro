-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 70.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cardio_activities" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "minutes" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cardio_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "muscu_activities" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "calories" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "muscu_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_entries" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "muscleMass" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "exercises_userId_name_type_idx" ON "exercises"("userId", "name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_userId_name_type_key" ON "exercises"("userId", "name", "type");

-- CreateIndex
CREATE INDEX "cardio_activities_userId_date_idx" ON "cardio_activities"("userId", "date");

-- CreateIndex
CREATE INDEX "muscu_activities_userId_date_idx" ON "muscu_activities"("userId", "date");

-- CreateIndex
CREATE INDEX "weight_entries_userId_date_idx" ON "weight_entries"("userId", "date");

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cardio_activities" ADD CONSTRAINT "cardio_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cardio_activities" ADD CONSTRAINT "cardio_activities_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muscu_activities" ADD CONSTRAINT "muscu_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "muscu_activities" ADD CONSTRAINT "muscu_activities_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
