import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import defaults from "./seed-data.json" with { type: "json" };

const prisma = new PrismaClient();

async function main() {
  const { config, weeks } = defaults;

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail || adminPassword) {
    if (!adminEmail || !adminPassword) {
      throw new Error("ADMIN_EMAIL e ADMIN_PASSWORD têm de ser definidos em conjunto.");
    }
    if (adminPassword.length < 6) {
      throw new Error("ADMIN_PASSWORD precisa de pelo menos 6 caracteres.");
    }
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.admin.upsert({
      where: { email: adminEmail },
      update: { passwordHash },
      create: { email: adminEmail, passwordHash },
    });
  }

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
      "header.logo": "Colo",
      "header.nav.sobre": "Sobre",
      "header.nav.menu": "As refeições desta semana",
      "header.nav.como": "Como funciona",
      "header.nav.pedido": "Fazer pedido",
      "header.cta": "Fazer pedido",

      "hero.badge": "Assinatura semanal · Luanda",
      "hero.title.pre": "Comida ",
      "hero.title.em": "que cuida",
      "hero.title.post": " de ti, semana após semana.",
      "hero.subtitle": "Refeições saudáveis, cozinhadas no próprio dia e entregues em tua casa. Pensadas para mulheres que querem chegar ao fim do dia com energia e sem ter de decidir o que fazer para o jantar.",
      "hero.cta.primary": "Fazer pedido",
      "hero.cta.secondary": "Ver menu da semana",
      "hero.stamp": "Feito em Luanda · com colo",
      "hero.image": "/assets/img/3.png",
      "hero.image.alt": "Prato colorido da Colo",
      "hero.floater.title": "A tua semana começa aqui.",
      "hero.floater.subtitle": "5 almoços + 5 sobremesas",

      "galeria.eyebrow": "A nossa cozinha",
      "galeria.title": "Assim chega a tua semana.",
      "galeria.subtitle": "Cada prato é montado com calma, em porções generosas e apresentado como se fosse para receber alguém especial. Porque és tu.",
      "galeria.0.image": "/assets/img/comida1.jpeg",
      "galeria.0.label": "Salada com ovo e cogumelos",
      "galeria.1.image": "/assets/img/comida2.jpeg",
      "galeria.1.label": "Bolo de laranja com canela",
      "galeria.2.image": "/assets/img/comida3.jpeg",
      "galeria.2.label": "Polvo com cuscuz e cenoura",
      "galeria.3.image": "/assets/img/comida4.jpeg",
      "galeria.3.label": "Peixe grelhado com feijão-verde",
      "galeria.4.image": "/assets/img/hero.jpg",
      "galeria.4.label": "Caril de grão com abóbora",

      "sobre.eyebrow": "Sobre a Colo",
      "sobre.title.pre": "Um serviço pensado para quem já ",
      "sobre.title.em": "dá muito",
      "sobre.title.post": " à sua semana.",
      "sobre.subtitle": "A Colo nasce da vontade de cozinhar para outras mulheres com o mesmo cuidado com que cozinhamos para quem amamos. Comida real, feita à mão, entregue quando dá jeito.",

      "beneficios.0.titulo": "Pensado para mulheres",
      "beneficios.0.texto": "Refeições que respeitam o ritmo, a energia e o corpo de cada semana.",
      "beneficios.1.titulo": "Ingredientes naturais",
      "beneficios.1.texto": "Produtos frescos, escolhidos com cuidado. Sem processados escondidos.",
      "beneficios.2.titulo": "Cozinhado no próprio dia",
      "beneficios.2.texto": "Preparado com calma, em pequenas quantidades, como se fosse para casa.",
      "beneficios.3.titulo": "Entrega semanal",
      "beneficios.3.texto": "Chega a tua semana toda de uma vez, pronta a aquecer e servir.",
      "beneficios.4.titulo": "Em Luanda (centro)",
      "beneficios.4.texto": "Entregamos no centro de Luanda e zonas próximas. Fala connosco.",

      "fundadora.image": "/assets/img/buddha.jpg",
      "fundadora.image.alt": "Winnie, fundadora da Colo",
      "fundadora.badge": "Winnie · Fundadora",
      "fundadora.eyebrow": "Quem cozinha por ti",
      "fundadora.title.pre": "Olá, sou a ",
      "fundadora.title.em": "Winnie",
      "fundadora.title.post": ".",
      "fundadora.p1": "A Colo nasceu num daqueles dias em que cheguei a casa tarde, cansada, e não tinha energia para pensar o que fazer para comer.",
      "fundadora.p2": "Sabia que não era só comigo. Muitas mulheres à minha volta viviam a mesma coisa.",
      "fundadora.p3": "Comecei a cozinhar para amigas. Depois para amigas de amigas. Hoje é a Colo.",

      "menu.0.dia": "Segunda",
      "menu.0.tema": "Leve",
      "menu.0.almoco": "Salada de quinoa com frango grelhado, abacate e molho de iogurte",
      "menu.0.sobremesa": "Mousse de maracujá",
      "menu.0.foto": "/assets/img/comida1.jpeg",
      "menu.1.dia": "Terça",
      "menu.1.tema": "Tradicional",
      "menu.1.almoco": "Calulu de peixe com funge e legumes salteados",
      "menu.1.sobremesa": "Doce de leite cremoso",
      "menu.1.foto": "/assets/img/comida2.jpeg",
      "menu.2.dia": "Quarta",
      "menu.2.tema": "Leve",
      "menu.2.almoco": "Salada de quinoa com frango grelhado, abacate e molho de iogurte",
      "menu.2.sobremesa": "Mousse de maracujá",
      "menu.2.foto": "/assets/img/comida3.jpeg",
      "menu.3.dia": "Quinta",
      "menu.3.tema": "Tradicional",
      "menu.3.almoco": "Calulu de peixe com funge e legumes salteados",
      "menu.3.sobremesa": "Doce de leite cremoso",
      "menu.3.foto": "/assets/img/comida4.jpeg",
      "menu.4.dia": "Sexta",
      "menu.4.tema": "Especial",
      "menu.4.almoco": "Arroz de pato com legumes assados",
      "menu.4.sobremesa": "Bolo de laranja com canela",
      "menu.4.foto": "/assets/img/hero.jpg",
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
