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

  const jaExisteContent = await prisma.siteContent.count();
  if (jaExisteContent === 0) {
    const defaults = {
      "hero.title.pre": "Comida ",
      "hero.title.em": "que cuida",
      "hero.title.post": " de ti, semana após semana.",
      "hero.subtitle": "Refeições saudáveis, cozinhadas no próprio dia e entregues em tua casa.",
      "hero.cta.primary": "Fazer pedido",
      "hero.cta.secondary": "Ver menu da semana",
      "hero.stamp": "Feito em Luanda · com colo",
      "hero.image": "/assets/img/3.png",
      "hero.image.alt": "Prato colorido da Colo",
      "menu.eyebrow": "As refeições desta semana",
      "menu.preco.label": "Semana completa",
      "como.eyebrow": "Como funciona",
      "footer.tagline": "Menos pressa. Mais cuidado. Mais tempo para ti.",
      "citacao.texto": "A semana começa antes de segunda-feira. Quando escolhes a Colo, não estás apenas a encomendar refeições — estás a oferecer a ti própria uma semana com menos decisões, menos pressa e mais tempo para o que realmente importa.",
    };
    for (const [key, value] of Object.entries(defaults)) {
      await prisma.siteContent.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
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
