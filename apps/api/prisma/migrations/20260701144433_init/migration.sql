-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SiteConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "dominio" TEXT NOT NULL DEFAULT '',
    "moeda" TEXT NOT NULL DEFAULT 'Kz',
    "mensagemDaSemana" TEXT NOT NULL DEFAULT '',
    "pagamento" JSONB NOT NULL DEFAULT [],
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MenuState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "semana" TEXT NOT NULL DEFAULT '',
    "estado" TEXT NOT NULL DEFAULT 'aberto',
    "vagasTotais" INTEGER NOT NULL DEFAULT 0,
    "vagasRestantes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Dish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL DEFAULT '',
    "preco" INTEGER NOT NULL DEFAULT 0,
    "tags" JSONB NOT NULL DEFAULT [],
    "foto" TEXT NOT NULL DEFAULT '',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");
