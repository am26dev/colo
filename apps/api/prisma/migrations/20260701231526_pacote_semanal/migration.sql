/*
  Warnings:

  - You are about to drop the `Dish` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Dish";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "MenuState";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Week" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataInicio" DATETIME NOT NULL,
    "dataFim" DATETIME NOT NULL,
    "precoSemanal" INTEGER NOT NULL DEFAULT 100000,
    "estado" TEXT NOT NULL DEFAULT 'aberto',
    "vagasTotais" INTEGER NOT NULL DEFAULT 0,
    "vagasRestantes" INTEGER NOT NULL DEFAULT 0,
    "ativaManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Day" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekId" TEXT NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "tema" TEXT NOT NULL DEFAULT '',
    "icone" TEXT NOT NULL DEFAULT '',
    "frase" TEXT NOT NULL DEFAULT '',
    "refeicoes" JSONB NOT NULL DEFAULT [],
    CONSTRAINT "Day_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weekId" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'semana',
    "nome" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "ciclo" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'novo',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "Week" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "dominio" TEXT NOT NULL DEFAULT '',
    "moeda" TEXT NOT NULL DEFAULT 'Kz',
    "mensagemDaSemana" TEXT NOT NULL DEFAULT '',
    "pagamento" JSONB NOT NULL DEFAULT [],
    "modoAutomaticoSemanas" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteConfig" ("dominio", "id", "instagram", "mensagemDaSemana", "moeda", "pagamento", "updatedAt", "whatsapp") SELECT "dominio", "id", "instagram", "mensagemDaSemana", "moeda", "pagamento", "updatedAt", "whatsapp" FROM "SiteConfig";
DROP TABLE "SiteConfig";
ALTER TABLE "new_SiteConfig" RENAME TO "SiteConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Day_weekId_diaSemana_key" ON "Day"("weekId", "diaSemana");
