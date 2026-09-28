-- Distingue o fecho automático por esgotamento de um fecho manual da dona.
-- Sem isto, devolver uma vaga a uma semana esgotada tinha de a reabrir sempre,
-- o que passava por cima de uma semana que a dona tinha fechado à mão.
ALTER TABLE "Week" ADD COLUMN "fechadaPorEsgotamento" BOOLEAN NOT NULL DEFAULT false;
