<?php
/* =========================================================
   COLO — Camada de dados (store)
   Guarda os dados de gestão NUMA PASTA PRIVADA, fora da
   public_html: não é acessível pela web e não é tocada pelos
   deploys (o rsync só mexe na public_html).
   ========================================================= */

if (!defined('COLO_OK')) { define('COLO_OK', true); }

/* public_html (raiz web) = pasta-pai de /lib */
function colo_webroot() {
  return dirname(__DIR__);
}

/* Pasta privada de dados: irmã da public_html (.../domains/colo.ao/colo_data) */
function colo_data_dir() {
  $dir = dirname(colo_webroot()) . '/colo_data';
  if (!is_dir($dir)) { @mkdir($dir, 0700, true); }
  return $dir;
}

function colo_site_file()    { return colo_data_dir() . '/site.json'; }
function colo_admin_file()   { return colo_data_dir() . '/admin.json'; }
function colo_default_file() { return colo_webroot() . '/data/site.default.json'; }

/* ---------- conteúdo do site (config + menu) ---------- */
function colo_load_site() {
  $f = colo_site_file();
  if (is_file($f)) {
    $j = json_decode(file_get_contents($f), true);
    if (is_array($j)) return colo_normalize($j);
  }
  // primeira vez: semear a partir do default versionado no repo
  $d = colo_default_file();
  if (is_file($d)) {
    $j = json_decode(file_get_contents($d), true);
    if (is_array($j)) { colo_save_site($j); return colo_normalize($j); }
  }
  return array('config' => array(), 'menu' => array('pratos' => array()));
}

function colo_normalize($j) {
  if (!isset($j['config']) || !is_array($j['config'])) $j['config'] = array();
  if (!isset($j['menu']) || !is_array($j['menu']))     $j['menu']   = array();
  if (!isset($j['menu']['pratos']) || !is_array($j['menu']['pratos'])) $j['menu']['pratos'] = array();
  return $j;
}

function colo_save_site($data) {
  $f = colo_site_file();
  $tmp = $f . '.tmp';
  $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  if ($json === false) return false;
  if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
  return @rename($tmp, $f);
}

/* ---------- credenciais do painel ---------- */
function colo_load_admin() {
  $f = colo_admin_file();
  if (is_file($f)) {
    $j = json_decode(file_get_contents($f), true);
    if (is_array($j) && !empty($j['hash'])) return $j;
  }
  return null;
}

function colo_save_admin($user, $passwordHash) {
  $f = colo_admin_file();
  $ok = file_put_contents($f, json_encode(array(
    'user' => $user,
    'hash' => $passwordHash,
    'atualizado' => date('c')
  ), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
  @chmod($f, 0600);
  return $ok !== false;
}
