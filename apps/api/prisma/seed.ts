import { PrismaClient } from "@prisma/client";
import defaults from "./seed-data.json" with { type: "json" };

const prisma = new PrismaClient();

async function main() {
  const { config, weeks } = defaults;

  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      whatsapp: config.whatsapp,
      instagram: config.instagram,
      dominio: config.dominio,
      moeda: config.moeda,
      mensagemDaSemana: config.mensagemDaSemana,
      pagamento: config.pagamento,
      modoAutomaticoSemanas: config.modoAutomaticoSemanas,
    },
  });

  const jaExisteWeek = await prisma.week.count();
  if (jaExisteWeek === 0) {
    for (const week of weeks) {
      await prisma.week.create({
        data: {
          dataInicio: new Date(week.dataInicio),
          dataFim: new Date(week.dataFim),
          precoSemanal: week.precoSemanal,
          estado: week.estado,
          vagasTotais: week.vagasTotais,
          vagasRestantes: week.vagasRestantes,
          ativaManual: false,
          dias: {
            create: week.dias.map((d) => ({
              diaSemana: d.diaSemana,
              tema: d.tema,
              frase: d.frase,
              refeicoes: d.refeicoes,
            })),
          },
        },
      });
    }
    // Activate first week by default
    const primeira = await prisma.week.findFirst({ orderBy: { dataInicio: "asc" } });
    if (primeira) {
      await prisma.week.update({ where: { id: primeira.id }, data: { ativaManual: true } });
    }
  }

  console.log("Seed concluido.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
