/*
  Warnings:

  - A unique constraint covering the columns `[taskListId,createdFromId]` on the table `CandidateTask` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CandidateTask_taskListId_createdFromId_key" ON "CandidateTask"("taskListId", "createdFromId");
