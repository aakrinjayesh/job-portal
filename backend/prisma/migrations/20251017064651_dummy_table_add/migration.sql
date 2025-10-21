-- CreateTable
CREATE TABLE "Dummy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userid" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Dummy_id_key" ON "Dummy"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Dummy_userid_key" ON "Dummy"("userid");

-- AddForeignKey
ALTER TABLE "Dummy" ADD CONSTRAINT "Dummy_userid_fkey" FOREIGN KEY ("userid") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
