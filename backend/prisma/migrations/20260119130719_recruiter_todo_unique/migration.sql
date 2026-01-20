/*
  Warnings:

  - A unique constraint covering the columns `[recruiterId,title]` on the table `RecruiterTodo` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RecruiterTodo_recruiterId_title_key" ON "RecruiterTodo"("recruiterId", "title");
