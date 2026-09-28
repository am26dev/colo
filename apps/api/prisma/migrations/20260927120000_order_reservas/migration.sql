-- Reservas: um pedido passa a ser uma reserva temporária que só consome vaga
-- quando é confirmado. `expiresAt` marca até quando a reserva bloqueia lugar;
-- NULL em pedidos já confirmados ou cancelados.
ALTER TABLE "Order" ADD COLUMN "expiresAt" DATETIME;

CREATE INDEX "Order_weekId_estado_idx" ON "Order"("weekId", "estado");

CREATE INDEX "Order_expiresAt_idx" ON "Order"("expiresAt");
