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
    if (MENU.estado === "fechado" || MENU.estado === "oculto") return false;
    var v = vagasRestantes();
    if (v !== null && v <= 0) return false;
    return true;
  }
  function whatsappLink(texto) {
    var num = (CFG.whatsapp || "").replace(/\D/g, "");
    var base = "https://wa.me/" + num;
    return texto ? base + "?text=" + encodeURIComponent(texto) : base;
  }

  /* ---------- cabeçalho: scroll state ---------- */
  (function headerScroll() {
    var header = $(".site-header");
    if (!header) return;
    var onScroll = function () {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ---------- cabeçalho: menu móvel ---------- */
  (function nav() {
    var header = $(".site-header");
    var toggle = $(".nav-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    $$(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
      });
    });
    // fechar ao clicar fora
    document.addEventListener("click", function (e) {
      if (header.classList.contains("open") && !header.contains(e.target)) {
        header.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  })();

  /* ---------- animações de entrada com IntersectionObserver ---------- */
  (function revealOnScroll() {
    var els = $$(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -20px 0px" });
    els.forEach(function (el) { obs.observe(el); });
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
    if (MENU.estado === "oculto") {
      grid.innerHTML = "<p class=\"menu-empty\">O menu está a ser preparado. Volta em breve. 💛</p>";
      return;
    }
    var pratos = MENU.pratos || [];
    if (!pratos.length) {
      grid.innerHTML = "<p class=\"menu-empty\">O menu desta semana está a ser preparado. Volta em breve. 💛</p>";
      return;
    }
    var aberto = pedidosAbertos();
    grid.innerHTML = pratos.map(function (p, i) {
      var foto = p.foto
        ? "style=\"background-image:url('" + esc(p.foto) + "');background-size:cover;background-position:center\""
        : "";
      var ph = p.foto ? "" : "<span class=\"ph\">Colo</span>";
      var tags = (p.tags || []).map(function (t) {
        return "<span class=\"tag\">" + esc(t) + "</span>";
      }).join("");
      var preco = p.preco ? "<span class=\"dish-price\">" + esc(fmtPreco(p.preco)) + "</span>" : "<span></span>";
      var botao = aberto
        ? "<a class=\"btn btn-ghost\" href=\"#pedido\" data-pick=\"" + esc(p.nome) + "\">Quero este prato</a>"
        : "<span class=\"tag\">indisponível</span>";
      var delay = i < 3 ? " reveal-delay-" + (i + 1) : "";
      return "" +
        "<article class=\"dish reveal" + delay + "\">" +
          "<div class=\"dish-photo\" " + foto + ">" + ph + "</div>" +
          "<div class=\"dish-body\">" +
            "<div class=\"dish-tags\">" + tags + "</div>" +
            "<h3>" + esc(p.nome) + "</h3>" +
            "<p class=\"dish-desc\">" + esc(p.descricao) + "</p>" +
            "<div class=\"dish-foot\">" + preco + botao + "</div>" +
          "</div>" +
        "</article>";
    }).join("");

    // activar reveal nos cards recém-criados
    (function () {
      var newEls = $$(".reveal", grid);
      if (!("IntersectionObserver" in window)) {
        newEls.forEach(function (el) { el.classList.add("visible"); });
        return;
      }
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
      newEls.forEach(function (el) { obs.observe(el); });
    })();

    // "Quero este prato" -> pré-preenche o campo de pratos
    $$("[data-pick]", grid).forEach(function (a) {
      a.addEventListener("click", function () {
        var campo = $("#pratos");
        if (!campo) return;
        var nome = a.getAttribute("data-pick");
        var atual = campo.value.trim();
        campo.value = atual ? atual + "\n1x " + nome : "1x " + nome;
        // feedback visual no campo
        campo.focus();
        campo.style.borderColor = "var(--rose-deep)";
        campo.style.boxShadow = "0 0 0 4px rgba(207, 155, 145, .2)";
        setTimeout(function () {
          campo.style.borderColor = "";
          campo.style.boxShadow = "";
        }, 1200);
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
    txt.textContent = "\u201C" + msg + "\u201D";
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

  /* ---------- seletor de pratos no formulário (select nativo) ---------- */
  function renderPratosPicker() {
    var sel = $('[data-pratos-select]');
    if (!sel) return;
    var pratos = MENU.pratos || [];
    if (!pratos.length) return;
    // adicionar as opções ao select
    pratos.forEach(function (p) {
      var opt = document.createElement('option');
      opt.value = p.nome;
      opt.textContent = p.nome + ' — ' + fmtPreco(p.preco);
      opt.setAttribute('data-preco', p.preco || 0);
      sel.appendChild(opt);
    });
    // mostrar preço selecionado
    sel.addEventListener('change', function () {
      var totalEl = $('#pratos-total');
      var totalValEl = $('#pratos-total-val');
      if (!totalEl || !totalValEl) return;
      var opt = sel.options[sel.selectedIndex];
      var preco = parseInt(opt.getAttribute('data-preco'), 10) || 0;
      if (!sel.value || !preco) {
        totalEl.hidden = true;
      } else {
        totalValEl.textContent = fmtPreco(preco);
        totalEl.hidden = false;
      }
    });
  }

  function getPratosEscolhidos() {
    var sel = $('[data-pratos-select]');
    if (!sel || !sel.value) return [];
    var opt = sel.options[sel.selectedIndex];
    var preco = parseInt(opt.getAttribute('data-preco'), 10) || 0;
    return [{ nome: sel.value, preco: preco, qty: 1 }];
  }

  /* ---------- formulário de pedido ---------- */
  function ligarFormulario() {
    var form = $('[data-order-form]');
    if (!form) return;

    if (!pedidosAbertos()) {
      var aviso = document.createElement('div');
      aviso.className = 'form-closed';
      aviso.innerHTML = 'Os pedidos desta semana estão <strong>encerrados</strong>. ' +
        'Deixa a tua mensagem que avisamos-te quando abrir a próxima semana.';
      form.insertBefore(aviso, form.firstChild);
      var btn = $('[data-order-submit]', form);
      if (btn) btn.textContent = 'Avisem-me na próxima semana';
    }

    // validação visual nos campos obrigatórios
    var inputs = $$('input[required], textarea[required]', form);
    inputs.forEach(function (inp) {
      inp.addEventListener('blur', function () {
        if (!inp.value.trim()) {
          inp.style.borderColor = 'var(--rose-deep)';
        } else {
          inp.style.borderColor = 'var(--sage)';
        }
      });
      inp.addEventListener('input', function () {
        if (inp.value.trim()) inp.style.borderColor = '';
      });
    });

    // botão comprovativo
    var btnComp = $('[data-comprovativo-btn]', form);
    if (btnComp) {
      btnComp.addEventListener('click', function () {
        var nome = $('#nome').value.trim();
        var msg = 'Olá Colo! 💛 Aqui está o comprovativo do meu pagamento.';
        if (nome) msg += ' (' + nome + ')';
        msg += '\nSemana: ' + (MENU.semana || '—');
        window.open(whatsappLink(msg), '_blank');
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = $('#nome').value.trim();
      var contacto = $('#contacto').value.trim();
      var ciclo = $('#ciclo').value;
      var notas = $('#notas').value.trim();
      var escolhidos = getPratosEscolhidos();

      if (!nome || !contacto) {
        if (!nome) { var nEl = $('#nome'); nEl.style.borderColor = 'var(--rose-deep)'; nEl.focus(); }
        else { var cEl = $('#contacto'); cEl.style.borderColor = 'var(--rose-deep)'; cEl.focus(); }
        return;
      }

      var submitBtn = $('[data-order-submit]', form);
      if (submitBtn) {
        submitBtn.setAttribute('disabled', 'true');
        submitBtn.textContent = 'A abrir o WhatsApp…';
      }

      var linhas = [];
      linhas.push('Olá Colo! Quero fazer um pedido. 💛');
      linhas.push('');
      linhas.push('Semana: ' + (MENU.semana || '—'));
      linhas.push('Nome: ' + nome);
      linhas.push('Contacto: ' + contacto);
      if (escolhidos.length) {
        linhas.push('');
        linhas.push('Pratos:');
        escolhidos.forEach(function (p) {
          linhas.push('  ' + p.qty + 'x ' + p.nome + ' (' + fmtPreco(p.preco) + ' cada)');
        });
        var total = escolhidos.reduce(function (acc, p) { return acc + p.preco * p.qty; }, 0);
        linhas.push('  Total: ' + fmtPreco(total));
      }
      if (ciclo) linhas.push('');
      if (ciclo) linhas.push('Fase do ciclo: ' + ciclo);
      if (notas) linhas.push('Notas: ' + notas);

      window.open(whatsappLink(linhas.join('\n')), '_blank');

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = 'Enviar pedido pelo WhatsApp';
        }
      }, 2500);
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
          setTimeout(function () { btn.textContent = txt; }, 2000);
        });
      } else if (navigator.share) {
        navigator.share({ title: "Colo — Comida que cuida de ti", url: url });
      }
    });
  }

  /* ---------- arranque ---------- */
  function init() {
    preencherSemana();
    preencherChip();
    preencherBanner();
    renderMenu();
    renderPratosPicker();
    preencherPagamento();
    preencherNota();
    preencherLinks();
    ligarFormulario();
    ligarPartilha();
  }

  // Tenta os dados geridos no painel (api.php); se falhar, usa os
  // dados estáticos de data/config.js e data/menu.js (recurso).
  function boot() {
    if (!window.fetch) { init(); return; }
    var done = false;
    var finish = function () { if (done) return; done = true; init(); };
    var timer = setTimeout(finish, 2500);
    fetch('api.php?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        clearTimeout(timer);
        if (data && (data.config || data.menu)) {
          if (data.config) CFG = data.config;
          if (data.menu) MENU = data.menu;
          moeda = (CFG && CFG.moeda) || "Kz";
        }
        finish();
      })
      .catch(function () { clearTimeout(timer); finish(); });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
