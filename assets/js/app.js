/* =========================================================
   COLO — Lógica do site
   - Lê data/config.js (COLO_CONFIG) e data/menu.js (COLO_MENU)
   - Mostra o menu da semana e o estado das vagas
   - Constrói o pedido pré-preenchido para o WhatsApp
   ========================================================= */
(function () {
  "use strict";

  var CFG = window.COLO_CONFIG || {};
  var MENU = window.COLO_MENU || {};
  var moeda = CFG.moeda || "Kz";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- utilidades ---------- */
  function fmtPreco(v) {
    if (v == null || v === "") return "";
    return Number(v).toLocaleString("pt-PT") + " " + moeda;
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function vagasRestantes() {
    var v = Number(MENU.vagasRestantes);
    return isNaN(v) ? null : v;
  }
  function pedidosAbertos() {
    if (MENU.estado === "fechado") return false;
    var v = vagasRestantes();
    if (v !== null && v <= 0) return false;
    return true;
  }
  function whatsappLink(texto) {
    var num = (CFG.whatsapp || "").replace(/\D/g, "");
    var base = "https://wa.me/" + num;
    return texto ? base + "?text=" + encodeURIComponent(texto) : base;
  }

  /* ---------- cabeçalho: menu móvel ---------- */
  (function nav() {
    var header = $(".site-header");
    var toggle = $(".nav-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  })();

  /* ---------- semana / cabeçalhos ---------- */
  function preencherSemana() {
    var semana = MENU.semana || "";
    $$("[data-week-label]").forEach(function (el) {
      el.textContent = semana ? "Menu · " + semana : "Menu desta semana";
    });
    var titulo = $("[data-week-title]");
    if (titulo && semana) titulo.textContent = "Semana de " + semana;
    var sub = $("[data-week-sub]");
    if (sub) sub.textContent = "Atualizado todas as quintas-feiras para a semana seguinte.";
  }

  /* ---------- chip de estado no hero ---------- */
  function preencherChip() {
    var chip = $("[data-status-chip]");
    var txt = $("[data-status-text]");
    if (!txt) return;
    var aberto = pedidosAbertos();
    var v = vagasRestantes();
    if (!aberto) {
      txt.textContent = "Pedidos encerrados esta semana";
      if (chip) chip.classList.add("is-closed");
    } else if (v !== null) {
      txt.textContent = v + (v === 1 ? " vaga disponível" : " vagas disponíveis") + " esta semana";
    } else {
      txt.textContent = "Pedidos abertos esta semana";
    }
  }

  /* ---------- banner do menu ---------- */
  function preencherBanner() {
    var el = $("[data-menu-banner]");
    if (!el) return;
    var aberto = pedidosAbertos();
    var v = vagasRestantes();
    var total = Number(MENU.vagasTotais);
    if (!aberto) {
      el.classList.add("is-closed");
      el.innerHTML = "<strong>Pedidos encerrados</strong> — o menu continua aqui para veres. " +
        "Volta na próxima quinta-feira ou fala connosco para a semana seguinte. 💛";
    } else {
      el.classList.remove("is-closed");
      var contagem = v !== null
        ? "<span class=\"vagas\">" + v + (isNaN(total) ? "" : "/" + total) + "</span> vagas ainda disponíveis"
        : "Pedidos abertos";
      el.innerHTML = contagem + " — reserva a tua refeição desta semana.";
    }
  }

  /* ---------- grelha de pratos ---------- */
  function renderMenu() {
    var grid = $("[data-menu-grid]");
    if (!grid) return;
    var pratos = MENU.pratos || [];
    if (!pratos.length) {
      grid.innerHTML = "<p class=\"menu-empty\">O menu desta semana está a ser preparado. Volta em breve. 💛</p>";
      return;
    }
    var aberto = pedidosAbertos();
    grid.innerHTML = pratos.map(function (p) {
      var foto = p.foto
        ? "style=\"background-image:url('" + esc(p.foto) + "')\""
        : "";
      var ph = p.foto ? "" : "<span class=\"ph\">Colo</span>";
      var tags = (p.tags || []).map(function (t) {
        return "<span class=\"tag\">" + esc(t) + "</span>";
      }).join("");
      var preco = p.preco ? "<span class=\"dish-price\">" + esc(fmtPreco(p.preco)) + "</span>" : "<span></span>";
      var botao = aberto
        ? "<a class=\"btn btn-ghost\" href=\"#pedido\" data-pick=\"" + esc(p.nome) + "\">Quero este prato</a>"
        : "<span class=\"tag\">indisponível</span>";
      return "" +
        "<article class=\"dish\">" +
          "<div class=\"dish-photo\" " + foto + ">" + ph + "</div>" +
          "<div class=\"dish-body\">" +
            "<div class=\"dish-tags\">" + tags + "</div>" +
            "<h3>" + esc(p.nome) + "</h3>" +
            "<p class=\"dish-desc\">" + esc(p.descricao) + "</p>" +
            "<div class=\"dish-foot\">" + preco + botao + "</div>" +
          "</div>" +
        "</article>";
    }).join("");

    // "Quero este prato" -> pré-preenche o campo de pratos
    $$("[data-pick]", grid).forEach(function (a) {
      a.addEventListener("click", function () {
        var campo = $("#pratos");
        if (!campo) return;
        var nome = a.getAttribute("data-pick");
        var atual = campo.value.trim();
        campo.value = atual ? atual + "\n1x " + nome : "1x " + nome;
      });
    });
  }

  /* ---------- pagamento ---------- */
  function preencherPagamento() {
    var ul = $("[data-pay-list]");
    if (!ul) return;
    var lista = CFG.pagamento || [];
    ul.innerHTML = lista.map(function (item) {
      return "<li><strong>" + esc(item.etiqueta) + ":</strong> " + esc(item.valor) + "</li>";
    }).join("") || "<li>Detalhes de pagamento enviados após o pedido.</li>";
  }

  /* ---------- mensagem da semana ---------- */
  function preencherNota() {
    var sec = $("[data-note-section]");
    var txt = $("[data-note-text]");
    if (!sec || !txt) return;
    var msg = (CFG.mensagemDaSemana || "").trim();
    if (!msg) { sec.hidden = true; return; }
    txt.textContent = "“" + msg + "”";
    sec.hidden = false;
  }

  /* ---------- ligações (WhatsApp / Instagram / domínio / ano) ---------- */
  function preencherLinks() {
    $$("[data-link-whatsapp]").forEach(function (a) { a.href = whatsappLink(""); });
    var hero = $("[data-wpp-hero]");
    var ig = $("[data-link-instagram]");
    if (ig && CFG.instagram) ig.href = CFG.instagram;
    var dom = $("[data-domain]");
    if (dom && CFG.dominio) dom.textContent = CFG.dominio;
    var ano = $("[data-year]");
    if (ano) ano.textContent = new Date().getFullYear();
    if (hero) {
      hero.addEventListener("click", function (e) {
        e.preventDefault();
        window.open(whatsappLink("Olá Colo! Vi o menu desta semana (" + (MENU.semana || "") + ") e queria saber mais. 💛"), "_blank");
      });
    }
  }

  /* ---------- formulário de pedido ---------- */
  function ligarFormulario() {
    var form = $("[data-order-form]");
    if (!form) return;

    if (!pedidosAbertos()) {
      var aviso = document.createElement("div");
      aviso.className = "form-closed";
      aviso.innerHTML = "Os pedidos desta semana estão <strong>encerrados</strong>. " +
        "Deixa a tua mensagem que avisamos-te quando abrir a próxima semana.";
      form.insertBefore(aviso, form.firstChild);
      var btn = $("[data-order-submit]", form);
      if (btn) btn.textContent = "Avisem-me na próxima semana";
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("#nome").value.trim();
      var contacto = $("#contacto").value.trim();
      var pratos = $("#pratos").value.trim();
      var ciclo = $("#ciclo").value;
      var notas = $("#notas").value.trim();

      if (!nome || !contacto) {
        alert("Por favor preenche o teu nome e contacto. 💛");
        return;
      }

      var linhas = [];
      linhas.push("Olá Colo! Quero fazer um pedido. 💛");
      linhas.push("");
      linhas.push("Semana: " + (MENU.semana || "—"));
      linhas.push("Nome: " + nome);
      linhas.push("Contacto: " + contacto);
      if (pratos) linhas.push("Pratos: " + pratos.replace(/\n/g, ", "));
      if (ciclo) linhas.push("Fase do ciclo: " + ciclo);
      if (notas) linhas.push("Notas: " + notas);

      window.open(whatsappLink(linhas.join("\n")), "_blank");
    });
  }

  /* ---------- partilhar / copiar link ---------- */
  function ligarPartilha() {
    var btn = $("[data-share-copy]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var url = window.location.href;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () {
          var txt = btn.textContent;
          btn.textContent = "Link copiado! ✓";
          setTimeout(function () { btn.textContent = txt; }, 1800);
        });
      }
    });
  }

  /* ---------- arranque ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    preencherSemana();
    preencherChip();
    preencherBanner();
    renderMenu();
    preencherPagamento();
    preencherNota();
    preencherLinks();
    ligarFormulario();
    ligarPartilha();
  });
})();
