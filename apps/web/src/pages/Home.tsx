import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/sections/Hero";
import { Sobre } from "../components/sections/Sobre";
import { MenuSemana } from "../components/sections/MenuSemana";
import { ComoFunciona } from "../components/sections/ComoFunciona";
import { Pedido } from "../components/sections/Pedido";
import { NotaColo } from "../components/sections/NotaColo";
import { useSiteContent } from "../hooks/useSiteContent";

export default function Home() {
  const { config, week } = useSiteContent();

  return (
    <>
      <Header />
      <Hero week={week} whatsapp={config.whatsapp} />
      <Sobre />
      <MenuSemana week={week} moeda={config.moeda} />
      <ComoFunciona />
      <Pedido week={week} config={config} />
      <NotaColo mensagem={config.mensagemDaSemana} />
      <Footer config={config} />
    </>
  );
}
