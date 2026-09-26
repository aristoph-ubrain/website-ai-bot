-- CreateTable
CREATE TABLE "Interview" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "brief" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Interview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
