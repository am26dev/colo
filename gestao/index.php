<?php
/* =========================================================
   COLO — Painel de gestão
   A cliente gere aqui o menu, as informações e o estado dos
   pedidos (abrir/encerrar) sem mexer em código.
   ========================================================= */
session_start();
require dirname(__DIR__) . '/lib/store.php';

if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(16)); }
function csrf_ok() { return isset($_POST['csrf']) && is_string($_POST['csrf']) && hash_equals($_SESSION['csrf'], $_POST['csrf']); }
function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function redirect_self($msg = null, $type = 'ok') {
  if ($msg !== null) { $_SESSION['flash'] = $msg; $_SESSION['flash_type'] = $type; }
  header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
  exit;
}

$admin    = colo_load_admin();
$loggedIn = !empty($_SESSION['colo_auth']);

/* ---------------- POST ---------------- */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $action = isset($_POST['action']) ? $_POST['action'] : '';

  /* 1) Configuração inicial (ainda não há palavra-passe) */
  if ($action === 'setup' && !$admin) {
    if (!csrf_ok()) redirect_self('A sessão expirou. Tenta novamente.', 'erro');
    $u  = trim(isset($_POST['user']) ? $_POST['user'] : '');
    $p  = isset($_POST['pass'])  ? $_POST['pass']  : '';
    $p2 = isset($_POST['pass2']) ? $_POST['pass2'] : '';
    if (strlen($u) < 3)        redirect_self('O utilizador precisa de pelo menos 3 caracteres.', 'erro');
    if (strlen($p) < 6)        redirect_self('A palavra-passe precisa de pelo menos 6 caracteres.', 'erro');
    if ($p !== $p2)            redirect_self('As palavras-passe não coincidem.', 'erro');
    colo_save_admin($u, password_hash($p, PASSWORD_DEFAULT));
    $_SESSION['colo_auth'] = true;
    redirect_self('Painel criado com sucesso. Bem-vinda à Colo! 💛');
  }

  /* 2) Login */
  if ($action === 'login' && $admin) {
    if (!csrf_ok()) redirect_self('A sessão expirou. Tenta novamente.', 'erro');
    $u = trim(isset($_POST['user']) ? $_POST['user'] : '');
    $p = isset($_POST['pass']) ? $_POST['pass'] : '';
    if (hash_equals(strtolower($admin['user']), strtolower($u)) && password_verify($p, $admin['hash'])) {
      $_SESSION['colo_auth'] = true;
      session_regenerate_id(true);
      redirect_self('Sessão iniciada. 💛');
    }
    redirect_self('Utilizador ou palavra-passe incorretos.', 'erro');
  }

  /* 3) Logout */
  if ($action === 'logout') {
    $_SESSION = array();
    session_destroy();
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
  }

  /* 4) Ações autenticadas */
  if ($loggedIn && csrf_ok()) {
    $site = colo_load_site();

    if ($action === 'toggle_estado') {
      $atual = isset($site['menu']['estado']) ? $site['menu']['estado'] : 'aberto';
      $site['menu']['estado'] = ($atual === 'aberto') ? 'fechado' : 'aberto';
      colo_save_site($site);
      redirect_self($site['menu']['estado'] === 'aberto'
        ? 'Pedidos REABERTOS — as clientes já podem reservar. 💛'
        : 'Pedidos ENCERRADOS — o menu continua visível, mas sem novas reservas.');
    }

    if ($action === 'save_estado') {
      $site['menu']['semana']         = trim(isset($_POST['semana']) ? $_POST['semana'] : '');
      $estado = isset($_POST['estado']) ? $_POST['estado'] : 'aberto';
      if (!in_array($estado, array('aberto', 'fechado', 'oculto'), true)) $estado = 'aberto';
      $site['menu']['estado']         = $estado;
      $site['menu']['vagasTotais']    = max(0, (int)(isset($_POST['vagasTotais']) ? $_POST['vagasTotais'] : 0));
      $site['menu']['vagasRestantes'] = max(0, (int)(isset($_POST['vagasRestantes']) ? $_POST['vagasRestantes'] : 0));
      colo_save_site($site);
      redirect_self('Estado da semana guardado. ✓');
    }

    if ($action === 'save_pratos') {
      $nomes  = isset($_POST['nome']) ? (array)$_POST['nome'] : array();
      $descs  = isset($_POST['descricao']) ? (array)$_POST['descricao'] : array();
      $precos = isset($_POST['preco']) ? (array)$_POST['preco'] : array();
      $tagss  = isset($_POST['tags']) ? (array)$_POST['tags'] : array();
      $fotos  = isset($_POST['foto']) ? (array)$_POST['foto'] : array();
      $pratos = array();
      foreach ($nomes as $i => $nome) {
        $nome = trim($nome);
        if ($nome === '') continue;
        $tagsRaw = isset($tagss[$i]) ? $tagss[$i] : '';
        $tags = array();
        foreach (explode(',', $tagsRaw) as $t) { $t = trim($t); if ($t !== '') $tags[] = $t; }
        $pratos[] = array(
          'nome'      => $nome,
          'descricao' => trim(isset($descs[$i]) ? $descs[$i] : ''),
          'preco'     => (int)(isset($precos[$i]) ? $precos[$i] : 0),
          'tags'      => $tags,
          'foto'      => trim(isset($fotos[$i]) ? $fotos[$i] : '')
        );
      }
      $site['menu']['pratos'] = $pratos;
      colo_save_site($site);
      redirect_self(count($pratos) . ' prato(s) guardado(s). ✓');
    }

    if ($action === 'save_info') {
      $site['config']['whatsapp']        = preg_replace('/\D+/', '', isset($_POST['whatsapp']) ? $_POST['whatsapp'] : '');
      $site['config']['instagram']       = trim(isset($_POST['instagram']) ? $_POST['instagram'] : '');
      $site['config']['dominio']         = trim(isset($_POST['dominio']) ? $_POST['dominio'] : '');
      $site['config']['moeda']           = trim(isset($_POST['moeda']) ? $_POST['moeda'] : 'Kz');
      $site['config']['mensagemDaSemana'] = trim(isset($_POST['mensagem']) ? $_POST['mensagem'] : '');
      $etq = isset($_POST['pag_etiqueta']) ? (array)$_POST['pag_etiqueta'] : array();
      $val = isset($_POST['pag_valor']) ? (array)$_POST['pag_valor'] : array();
      $pag = array();
      foreach ($etq as $i => $e) {
        $e = trim($e); $v = trim(isset($val[$i]) ? $val[$i] : '');
        if ($e === '' && $v === '') continue;
        $pag[] = array('etiqueta' => $e, 'valor' => $v);
      }
      $site['config']['pagamento'] = $pag;
      colo_save_site($site);
      redirect_self('Informações do site guardadas. ✓');
    }

    if ($action === 'change_password') {
      $atual = isset($_POST['atual']) ? $_POST['atual'] : '';
      $nova  = isset($_POST['nova'])  ? $_POST['nova']  : '';
      $nova2 = isset($_POST['nova2']) ? $_POST['nova2'] : '';
      if (!password_verify($atual, $admin['hash'])) redirect_self('A palavra-passe atual está incorreta.', 'erro');
      if (strlen($nova) < 6)  redirect_self('A nova palavra-passe precisa de pelo menos 6 caracteres.', 'erro');
      if ($nova !== $nova2)   redirect_self('A confirmação não coincide.', 'erro');
      colo_save_admin($admin['user'], password_hash($nova, PASSWORD_DEFAULT));
      redirect_self('Palavra-passe alterada. ✓');
    }
  } elseif ($loggedIn) {
    redirect_self('A sessão expirou. Tenta novamente.', 'erro');
  }
}

/* ---------------- dados para render ---------------- */
$site   = colo_load_site();
$cfg    = $site['config'];
$menu   = $site['menu'];
$pratos = $menu['pratos'];
$pag    = isset($cfg['pagamento']) ? $cfg['pagamento'] : array();
$estado = isset($menu['estado']) ? $menu['estado'] : 'aberto';
$csrf   = $_SESSION['csrf'];
$flash  = isset($_SESSION['flash']) ? $_SESSION['flash'] : '';
$flashType = isset($_SESSION['flash_type']) ? $_SESSION['flash_type'] : 'ok';
unset($_SESSION['flash'], $_SESSION['flash_type']);
?>
<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="noindex, nofollow" />
<title>Painel da Colo</title>
<style>
  :root{
    --brown:#6b3f1f; --brown-dark:#4e2e13; --cream:#f7ede3; --cream-3:#faf5ef;
    --rose:#c98b82; --rose-deep:#b87268; --sage:#7d9178; --ink:#3e2a18; --muted:#8a7060;
    --radius:16px; --shadow:0 14px 40px -18px rgba(78,46,19,.35);
  }
  *{box-sizing:border-box}
  body{margin:0;font-family:"Segoe UI",system-ui,-apple-system,sans-serif;background:var(--cream);
    color:var(--ink);line-height:1.6;font-size:15px}
  a{color:var(--rose-deep)}
  .wrap{max-width:860px;margin:0 auto;padding:24px 18px 80px}
  .topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
  .logo{font-family:Georgia,serif;font-size:1.7rem;color:var(--brown);font-weight:700}
  .logo small{display:block;font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;color:var(--muted);font-weight:400}
  h1{font-family:Georgia,serif;color:var(--brown-dark);font-size:1.5rem;margin:.2em 0}
  h2{font-family:Georgia,serif;color:var(--brown-dark);font-size:1.2rem;margin:0 0 4px}
  .card{background:#fff;border:1px solid rgba(107,74,46,.1);border-radius:var(--radius);
    padding:22px;margin:18px 0;box-shadow:var(--shadow)}
  .card .sub{color:var(--muted);font-size:.9rem;margin:0 0 16px}
  label{display:block;font-weight:600;color:var(--brown-dark);font-size:.85rem;margin:14px 0 6px}
  input[type=text],input[type=password],input[type=number],input[type=url],textarea,select{
    width:100%;font:inherit;padding:10px 12px;border:1.5px solid rgba(107,74,46,.22);
    border-radius:10px;background:var(--cream-3);color:var(--ink)}
  input:focus,textarea:focus,select:focus{outline:none;border-color:var(--rose-deep);
    box-shadow:0 0 0 3px rgba(201,139,130,.18)}
  textarea{resize:vertical;min-height:64px}
  .btn{display:inline-flex;align-items:center;gap:8px;font:inherit;font-weight:600;cursor:pointer;
    border:0;border-radius:999px;padding:12px 24px;background:var(--brown);color:var(--cream-3);
    text-decoration:none;transition:.15s}
  .btn:hover{background:var(--brown-dark)}
  .btn.ghost{background:transparent;border:1.5px solid rgba(107,74,46,.3);color:var(--brown-dark)}
  .btn.ghost:hover{background:rgba(107,74,46,.06)}
  .btn.rose{background:var(--rose-deep)} .btn.rose:hover{background:var(--rose)}
  .btn.sage{background:var(--sage)}
  .btn.sm{padding:8px 16px;font-size:.85rem}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .flash{padding:12px 16px;border-radius:12px;margin:14px 0;font-weight:500}
  .flash.ok{background:rgba(125,145,120,.16);color:#41603a;border:1px solid rgba(125,145,120,.5)}
  .flash.erro{background:rgba(184,114,104,.14);color:#8a3a2e;border:1px solid rgba(184,114,104,.5)}
  .estado-box{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .estado-pill{font-weight:700;padding:8px 16px;border-radius:999px;font-size:.95rem}
  .estado-pill.aberto{background:rgba(125,145,120,.18);color:#41603a}
  .estado-pill.fechado{background:rgba(184,114,104,.16);color:#8a3a2e}
  .prato{border:1px solid rgba(107,74,46,.14);border-radius:12px;padding:14px;margin-bottom:12px;background:var(--cream-3)}
  .prato .row3{display:grid;grid-template-columns:2fr 1fr;gap:12px}
  .prato-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
  .del{background:none;border:0;color:var(--rose-deep);cursor:pointer;font-weight:600;font-size:.85rem}
  .muted{color:var(--muted);font-size:.82rem}
  .actions{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap}
  .pag-row{display:grid;grid-template-columns:1fr 1.4fr auto;gap:10px;margin-bottom:8px;align-items:center}
  .center{min-height:100vh;display:grid;place-items:center;padding:20px}
  .login-card{max-width:380px;width:100%}
  @media(max-width:600px){.row,.prato .row3{grid-template-columns:1fr}}
</style>
</head>
<body>
<?php if ($flash): ?>
  <div class="wrap" style="padding-bottom:0"><div class="flash <?= h($flashType) ?>"><?= h($flash) ?></div></div>
<?php endif; ?>

<?php if (!$admin): /* ---------- SETUP INICIAL ---------- */ ?>
<div class="center">
  <div class="card login-card">
    <div class="logo">Colo<small>Painel de gestão</small></div>
    <h1>Bem-vinda! 💛</h1>
    <p class="sub">Cria o teu acesso ao painel. Guarda bem estes dados.</p>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
      <input type="hidden" name="action" value="setup">
      <label>Utilizador</label>
      <input type="text" name="user" autocomplete="username" placeholder="ex.: colo" required>
      <label>Palavra-passe</label>
      <input type="password" name="pass" autocomplete="new-password" placeholder="mínimo 6 caracteres" required>
      <label>Repetir palavra-passe</label>
      <input type="password" name="pass2" autocomplete="new-password" required>
      <div class="actions"><button class="btn" type="submit">Criar painel</button></div>
    </form>
  </div>
</div>

<?php elseif (!$loggedIn): /* ---------- LOGIN ---------- */ ?>
<div class="center">
  <div class="card login-card">
    <div class="logo">Colo<small>Painel de gestão</small></div>
    <h1>Entrar</h1>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
      <input type="hidden" name="action" value="login">
      <label>Utilizador</label>
      <input type="text" name="user" autocomplete="username" required>
      <label>Palavra-passe</label>
      <input type="password" name="pass" autocomplete="current-password" required>
      <div class="actions"><button class="btn" type="submit">Entrar</button></div>
    </form>
  </div>
</div>

<?php else: /* ---------- PAINEL ---------- */ ?>
<div class="wrap">
  <div class="topbar">
    <div class="logo">Colo<small>Painel de gestão</small></div>
    <div style="display:flex;gap:8px">
      <a class="btn ghost sm" href="/" target="_blank">Ver site ↗</a>
      <form method="post" style="margin:0">
        <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
        <input type="hidden" name="action" value="logout">
        <button class="btn ghost sm" type="submit">Sair</button>
      </form>
    </div>
  </div>

  <!-- ESTADO DOS PEDIDOS -->
  <div class="card">
    <h2>Pedidos da semana</h2>
    <p class="sub">Quando esgotares as vagas (ex.: 6 pedidos), encerra aqui para não receberes mais reservas. O menu continua visível.</p>
    <div class="estado-box">
      <span class="estado-pill <?= $estado === 'aberto' ? 'aberto' : 'fechado' ?>">
        <?= $estado === 'aberto' ? '🟢 Pedidos ABERTOS' : ($estado === 'oculto' ? '⚫ Menu OCULTO' : '🔴 Pedidos ENCERRADOS') ?>
      </span>
      <form method="post" style="margin:0">
        <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
        <input type="hidden" name="action" value="toggle_estado">
        <?php if ($estado === 'aberto'): ?>
          <button class="btn rose" type="submit">Encerrar pedidos</button>
        <?php else: ?>
          <button class="btn sage" type="submit">Reabrir pedidos</button>
        <?php endif; ?>
      </form>
    </div>

    <form method="post" style="margin-top:18px">
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
      <input type="hidden" name="action" value="save_estado">
      <div class="row">
        <div>
          <label>Datas da semana</label>
          <input type="text" name="semana" value="<?= h($menu['semana'] ?? '') ?>" placeholder="ex.: 22 a 26 de junho">
        </div>
        <div>
          <label>Estado do menu</label>
          <select name="estado">
            <option value="aberto"  <?= $estado === 'aberto'  ? 'selected' : '' ?>>Aberto — aceita reservas</option>
            <option value="fechado" <?= $estado === 'fechado' ? 'selected' : '' ?>>Encerrado — menu visível, sem reservas</option>
            <option value="oculto"  <?= $estado === 'oculto'  ? 'selected' : '' ?>>Oculto — esconder o menu do site</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div>
          <label>Vagas totais da semana</label>
          <input type="number" name="vagasTotais" min="0" value="<?= h($menu['vagasTotais'] ?? 6) ?>">
        </div>
        <div>
          <label>Vagas ainda disponíveis</label>
          <input type="number" name="vagasRestantes" min="0" value="<?= h($menu['vagasRestantes'] ?? 6) ?>">
          <p class="muted">Quando chega a 0, os pedidos fecham automaticamente.</p>
        </div>
      </div>
      <div class="actions"><button class="btn" type="submit">Guardar estado</button></div>
    </form>
  </div>

  <!-- PRATOS -->
  <div class="card">
    <h2>Menu — pratos da semana</h2>
    <p class="sub">Adiciona, edita ou remove pratos. Na foto, podes pôr o nome de um ficheiro (ex.: <code>assets/img/salmao.jpg</code>) ou colar um link de imagem.</p>
    <form method="post" id="form-pratos">
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
      <input type="hidden" name="action" value="save_pratos">
      <div id="pratos-lista">
        <?php if (!$pratos): $pratos = array(array('nome'=>'','descricao'=>'','preco'=>'','tags'=>array(),'foto'=>'')); endif; ?>
        <?php foreach ($pratos as $p): ?>
        <div class="prato">
          <div class="prato-head"><strong class="muted">Prato</strong><button type="button" class="del" onclick="this.closest('.prato').remove()">remover ✕</button></div>
          <label>Nome</label>
          <input type="text" name="nome[]" value="<?= h($p['nome'] ?? '') ?>" placeholder="ex.: Salmão assado">
          <label>Descrição</label>
          <textarea name="descricao[]" placeholder="Breve descrição do prato"><?= h($p['descricao'] ?? '') ?></textarea>
          <div class="row3">
            <div>
              <label>Etiquetas (separadas por vírgula)</label>
              <input type="text" name="tags[]" value="<?= h(implode(', ', isset($p['tags']) && is_array($p['tags']) ? $p['tags'] : array())) ?>" placeholder="Anti-inflamatória, Leve">
            </div>
            <div>
              <label>Preço (Kz)</label>
              <input type="number" name="preco[]" min="0" value="<?= h($p['preco'] ?? '') ?>" placeholder="6500">
            </div>
          </div>
          <label>Foto (ficheiro ou link)</label>
          <input type="text" name="foto[]" value="<?= h($p['foto'] ?? '') ?>" placeholder="assets/img/salmao.jpg">
        </div>
        <?php endforeach; ?>
      </div>
      <div class="actions">
        <button type="button" class="btn ghost" onclick="addPrato()">+ Adicionar prato</button>
        <button type="submit" class="btn">Guardar pratos</button>
      </div>
    </form>
  </div>

  <!-- INFORMAÇÕES -->
  <div class="card">
    <h2>Informações do site</h2>
    <p class="sub">Contactos, pagamento e a mensagem da semana.</p>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
      <input type="hidden" name="action" value="save_info">
      <div class="row">
        <div>
          <label>WhatsApp (com 244, só dígitos)</label>
          <input type="text" name="whatsapp" value="<?= h($cfg['whatsapp'] ?? '') ?>" placeholder="244924644918">
        </div>
        <div>
          <label>Instagram (link)</label>
          <input type="text" name="instagram" value="<?= h($cfg['instagram'] ?? '') ?>" placeholder="https://instagram.com/...">
        </div>
      </div>
      <div class="row">
        <div>
          <label>Domínio (rodapé)</label>
          <input type="text" name="dominio" value="<?= h($cfg['dominio'] ?? 'colo.ao') ?>">
        </div>
        <div>
          <label>Moeda</label>
          <input type="text" name="moeda" value="<?= h($cfg['moeda'] ?? 'Kz') ?>">
        </div>
      </div>

      <label>Pagamento (Multicaixa Express / IBAN / Titular)</label>
      <div id="pag-lista">
        <?php if (!$pag): $pag = array(array('etiqueta'=>'','valor'=>'')); endif; ?>
        <?php foreach ($pag as $item): ?>
        <div class="pag-row">
          <input type="text" name="pag_etiqueta[]" value="<?= h($item['etiqueta'] ?? '') ?>" placeholder="Multicaixa Express">
          <input type="text" name="pag_valor[]" value="<?= h($item['valor'] ?? '') ?>" placeholder="923 000 000">
          <button type="button" class="del" onclick="this.closest('.pag-row').remove()">✕</button>
        </div>
        <?php endforeach; ?>
      </div>
      <button type="button" class="btn ghost sm" onclick="addPag()">+ Linha de pagamento</button>

      <label style="margin-top:16px">Mensagem da semana (deixa vazio para esconder)</label>
      <textarea name="mensagem" placeholder="Uma mensagem carinhosa..."><?= h($cfg['mensagemDaSemana'] ?? '') ?></textarea>

      <div class="actions"><button class="btn" type="submit">Guardar informações</button></div>
    </form>
  </div>

  <!-- CONTA -->
  <div class="card">
    <h2>A minha conta</h2>
    <form method="post">
      <input type="hidden" name="csrf" value="<?= h($csrf) ?>">
      <input type="hidden" name="action" value="change_password">
      <div class="row">
        <div>
          <label>Palavra-passe atual</label>
          <input type="password" name="atual" autocomplete="current-password">
        </div>
        <div></div>
      </div>
      <div class="row">
        <div>
          <label>Nova palavra-passe</label>
          <input type="password" name="nova" autocomplete="new-password">
        </div>
        <div>
          <label>Repetir nova</label>
          <input type="password" name="nova2" autocomplete="new-password">
        </div>
      </div>
      <div class="actions"><button class="btn ghost" type="submit">Alterar palavra-passe</button></div>
    </form>
  </div>
</div>

<template id="tpl-prato">
  <div class="prato">
    <div class="prato-head"><strong class="muted">Prato</strong><button type="button" class="del" onclick="this.closest('.prato').remove()">remover ✕</button></div>
    <label>Nome</label>
    <input type="text" name="nome[]" placeholder="ex.: Salmão assado">
    <label>Descrição</label>
    <textarea name="descricao[]" placeholder="Breve descrição do prato"></textarea>
    <div class="row3">
      <div>
        <label>Etiquetas (separadas por vírgula)</label>
        <input type="text" name="tags[]" placeholder="Anti-inflamatória, Leve">
      </div>
      <div>
        <label>Preço (Kz)</label>
        <input type="number" name="preco[]" min="0" placeholder="6500">
      </div>
    </div>
    <label>Foto (ficheiro ou link)</label>
    <input type="text" name="foto[]" placeholder="assets/img/salmao.jpg">
  </div>
</template>

<script>
  function addPrato(){
    var t = document.getElementById('tpl-prato');
    document.getElementById('pratos-lista').appendChild(t.content.cloneNode(true));
  }
  function addPag(){
    var d = document.createElement('div');
    d.className = 'pag-row';
    d.innerHTML = '<input type="text" name="pag_etiqueta[]" placeholder="Etiqueta">' +
                  '<input type="text" name="pag_valor[]" placeholder="Valor">' +
                  '<button type="button" class="del" onclick="this.closest(\'.pag-row\').remove()">✕</button>';
    document.getElementById('pag-lista').appendChild(d);
  }
</script>
<?php endif; ?>
</body>
</html>
