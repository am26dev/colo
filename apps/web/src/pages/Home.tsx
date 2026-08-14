import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/sections/Hero";
import { Galeria } from "../components/sections/Galeria";
import { Sobre } from "../components/sections/Sobre";
import { Fundadora } from "../components/sections/Fundadora";
import { MenuSemana } from "../components/sections/MenuSemana";
import { ComoFunciona } from "../components/sections/ComoFunciona";
import { Incluido } from "../components/sections/Incluido";
import { Testemunhos } from "../components/sections/Testemunhos";
import { Pedido } from "../components/sections/Pedido";
import { Citacao } from "../components/sections/Citacao";
import { NotaColo } from "../components/sections/NotaColo";
import { useSiteContent } from "../hooks/useSiteContent";
import { useEditMode } from "../edit-mode/EditModeProvider";

export default function Home() {
  const { config, week } = useSiteContent();
  const { isEditing } = useEditMode();

  return (
    <div className={isEditing ? "pt-14" : ""}>
      <Header />
      <main>
        <Hero />
        <Galeria />
        <Sobre />
        <Fundadora />
        <MenuSemana week={week} />
        <ComoFunciona />
        <Incluido />
        <Testemunhos />
        <Pedido week={week} config={config} />
        <Citacao />
        <NotaColo mensagem={config.mensagemDaSemana} />
      </main>
      <Footer config={config} />
    </div>
  );
}
