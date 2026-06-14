/*
  Warnings:

  - You are about to drop the column `completedDate` on the `WorkoutPlanDay` table. All the data in the column will be lost.
  - You are about to drop the column `isRestDay` on the `WorkoutPlanDay` table. All the data in the column will be lost.
  - You are about to drop the column `runId` on the `WorkoutPlanDay` table. All the data in the column will be lost.
  - You are about to drop the column `runType` on the `WorkoutPlanDay` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `WorkoutPlanDay` table. All the data in the column will be lost.
  - You are about to drop the column `workoutId` on the `WorkoutPlanDay` table. All the data in the column will be lost.
  - You are about to drop the column `workoutType` on the `WorkoutPlanDay` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('Workout', 'Run', 'Rest');

-- DropForeignKey
ALTER TABLE "WorkoutPlanDay" DROP CONSTRAINT "WorkoutPlanDay_runId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutPlanDay" DROP CONSTRAINT "WorkoutPlanDay_workoutId_fkey";

-- DropIndex
DROP INDEX "WorkoutPlanDay_status_idx";

-- AlterTable
ALTER TABLE "WorkoutPlanDay" DROP COLUMN "completedDate",
DROP COLUMN "isRestDay",
DROP COLUMN "runId",
DROP COLUMN "runType",
DROP COLUMN "status",
DROP COLUMN "workoutId",
DROP COLUMN "workoutType";

-- CreateTable
CREATE TABLE "WorkoutPlanDayActivity" (
    "id" TEXT NOT NULL,
    "workoutPlanDayId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "activityType" "ActivityType" NOT NULL,
    "name" TEXT,
    "workoutType" "WorkoutType",
    "runType" "RunType",
    "targetDistanceKm" DOUBLE PRECISION,
    "targetDurationMinutes" INTEGER,
    "targetPace" DOUBLE PRECISION,
    "notes" TEXT,
    "status" "PlanDayStatus" NOT NULL DEFAULT 'Pending',
    "completedDate" TIMESTAMP(3),
    "workoutId" TEXT,
    "runId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutPlanDayActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkoutPlanDayActivity_workoutPlanDayId_idx" ON "WorkoutPlanDayActivity"("workoutPlanDayId");

-- CreateIndex
CREATE INDEX "WorkoutPlanDayActivity_status_idx" ON "WorkoutPlanDayActivity"("status");

-- AddForeignKey
ALTER TABLE "WorkoutPlanDayActivity" ADD CONSTRAINT "WorkoutPlanDayActivity_workoutPlanDayId_fkey" FOREIGN KEY ("workoutPlanDayId") REFERENCES "WorkoutPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanDayActivity" ADD CONSTRAINT "WorkoutPlanDayActivity_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlanDayActivity" ADD CONSTRAINT "WorkoutPlanDayActivity_runId_fkey" FOREIGN KEY ("runId") REFERENCES "RunActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
