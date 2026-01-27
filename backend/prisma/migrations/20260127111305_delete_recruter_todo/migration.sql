/*
  Warnings:

  - You are about to drop the `RecruiterTodo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecruiterTodo" DROP CONSTRAINT "RecruiterTodo_recruiterId_fkey";

-- DropTable
DROP TABLE "RecruiterTodo";
