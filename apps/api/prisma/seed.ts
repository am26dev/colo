import { PrismaClient } from "@prisma/client";
import defaults from "./seed-data.json" with { type: "json" };

const prisma = new PrismaClient();

/** Segunda-feira e Sexta-feira (UTC) da semana que contém "hoje" — mesma
 *  base de datas usada em src/lib/activeWeek.ts para resolver a semana activa. */
function semanaCorrenteRange(): { inicio: Date; fim: Date } {
  const agora = new Date();
  const hoje = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()));
  const diaSemana = hoje.getUTCDay(); // 0=Domingo..6=Sábado
  const deltaSegunda = diaSemana === 0 ? -6 : 1 - diaSemana;
  const inicio = new Date(hoje);
  inicio.setUTCDate(hoje.getUTCDate() + deltaSegunda);
  const fim = new Date(inicio);
  fim.setUTCDate(inicio.getUTCDate() + 4);
  return { inicio, fim };
}

async function main() {
  const { config, week } = defaults;

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
    const { inicio, fim } = semanaCorrenteRange();
    await prisma.week.create({
      data: {
        dataInicio: inicio,
        dataFim: fim,
        precoSemanal: week.precoSemanal,
        estado: week.estado,
        vagasTotais: week.vagasTotais,
        vagasRestantes: week.vagasRestantes,
        ativaManual: true,
        dias: {
          create: week.dias.map((d) => ({
            diaSemana: d.diaSemana,
            tema: d.tema,
            icone: d.icone,
            frase: d.frase,
            refeicoes: d.refeicoes,
          })),
        },
      },
    });
  }

  console.log("Seed concluído.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
