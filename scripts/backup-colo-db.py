#!/usr/bin/env python3
"""Backup online (e seguro) da base de dados SQLite de producao do Colo.

Usa a API `Connection.backup()` do modulo sqlite3 em vez de `cp`: o ficheiro
pode estar a ser escrito pela API a cada pedido, e uma copia byte-a-byte de um
ficheiro SQLite em movimento pode sair truncada. A API de backup produz sempre
um ficheiro consistente, mesmo com escrita concorrente.

Uso: backup-colo-db.py [caminho/da/BD] [directorio/destino]
"""

import datetime
import pathlib
import shutil
import sqlite3
import sys

DEFAULT_DB = "/var/www/colo-app/apps/api/prisma/dev.db"
DEFAULT_OUT = "/var/backups/colo"


def contar_tabelas(con: sqlite3.Connection) -> dict[str, int]:
    """Numero de linhas por tabela, para o log do backup."""
    tabelas = [
        linha[0]
        for linha in con.execute(
            "select name from sqlite_master where type='table' and name not like 'sqlite_%'"
        )
    ]
    contagens = {}
    for tabela in tabelas:
        # Aspas duplas porque o Prisma nomeia varias tabelas com maiuscula
        # ("Order", "User"), que sao palavras reservadas em SQL.
        try:
            contagens[tabela] = con.execute(f'select count(*) from "{tabela}"').fetchone()[0]
        except sqlite3.Error as exc:
            contagens[tabela] = f"erro: {exc}"
    return contagens


def main() -> int:
    origem = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DB)
    destino_dir = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUT)

    if not origem.is_file():
        print(f"ERRO: base de dados nao encontrada: {origem}", file=sys.stderr)
        return 1

    destino_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    destino = destino_dir / f"colo_{stamp}.db"

    origem_con = sqlite3.connect(f"file:{origem}?mode=ro", uri=True)
    try:
        destino_con = sqlite3.connect(destino)
        try:
            origem_con.backup(destino_con)
            destino_con.execute("vacuum")
        finally:
            destino_con.close()

        # Verificar integridade do ficheiro resultante antes de dizer que correu bem.
        check = sqlite3.connect(f"file:{destino}?mode=ro", uri=True)
        try:
            integridade = check.execute("pragma integrity_check").fetchone()[0]
            contagens = contar_tabelas(check)
        finally:
            check.close()
    finally:
        origem_con.close()

    if integridade != "ok":
        print(f"ERRO: integridade falhou no backup ({integridade})", file=sys.stderr)
        return 2

    tamanho = destino.stat().st_size
    print(f"backup: {destino} ({tamanho // 1024} KB, integridade {integridade})")
    for tabela, contagem in sorted(contagens.items()):
        print(f"  {tabela}: {contagem}")

    # Manter as ultimas 30 copias.
    copias = sorted(destino_dir.glob("colo_*.db"))
    for velha in copias[:-30]:
        velha.unlink()
        print(f"  (removida copia antiga {velha.name})")
    shutil.copy2(destino, destino_dir / "colo_last.db")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
