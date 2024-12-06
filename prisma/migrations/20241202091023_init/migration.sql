/*
  Warnings:

  - You are about to drop the column `fileId` on the `Document` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "FileReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "document" TEXT,
    CONSTRAINT "FileReference_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FileReference_document_fkey" FOREIGN KEY ("document") REFERENCES "Document" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Document" ("content", "createdAt", "id", "title", "updatedAt") SELECT "content", "createdAt", "id", "title", "updatedAt" FROM "Document";
DROP TABLE "Document";
ALTER TABLE "new_Document" RENAME TO "Document";
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "size" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "testINt" INTEGER NOT NULL DEFAULT 0,
    "isMapped" BOOLEAN NOT NULL DEFAULT false,
    "mappedTo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_File" ("createdAt", "filename", "id", "isMapped", "mappedTo", "mimetype", "path", "size") SELECT "createdAt", "filename", "id", "isMapped", "mappedTo", "mimetype", "path", "size" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "FileReference_fileId_idx" ON "FileReference"("fileId");

-- CreateIndex
CREATE INDEX "FileReference_document_idx" ON "FileReference"("document");
