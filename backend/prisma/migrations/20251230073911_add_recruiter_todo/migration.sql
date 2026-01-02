-- CreateTable
CREATE TABLE "RecruiterTodo" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecruiterTodo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecruiterTodo_recruiterId_idx" ON "RecruiterTodo"("recruiterId");

-- AddForeignKey
ALTER TABLE "RecruiterTodo" ADD CONSTRAINT "RecruiterTodo_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
