-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
