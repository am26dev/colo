<?php
/* =========================================================
   COLO — API pública (apenas leitura)
   Devolve o conteúdo atual do site (config + menu) em JSON.
   O site público (app.js) lê daqui; se falhar, usa os dados
   estáticos de data/config.js e data/menu.js como recurso.
   ========================================================= */
require __DIR__ . '/lib/store.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');
header('Access-Control-Allow-Origin: *');

echo json_encode(colo_load_site(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
