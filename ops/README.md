# Operação do servidor — o que está instalado na VPS

Estas são cópias, **verbatim**, dos ficheiros que estão no servidor. A razão de
estarem aqui é a mesma do `scripts/deploy-colo.sh`: o que corre em produção tem
de ser revisto num ecrã e não vivido na memória de alguém. Se mudares um
ficheiro no servidor, muda-o aqui também — ou melhor, muda aqui, copia para o
servidor, e valida antes de activar.

| Ficheiro no servidor | Cópia aqui | Para que serve |
|---|---|---|
| `/etc/ssh/sshd_config.d/10-colo-hardening.conf` | `ops/ssh/` | Autenticação só por chave; `MaxStartups` com folga para os scanners não descartarem o deploy |
| `/etc/fail2ban/jail.d/99-colo.local` | `ops/fail2ban/` | Ban de 24 h aos que batem à porta 22; `169.254.0.0/16` em `ignoreip` para nunca fechar a porta à dona |
| `/usr/local/bin/deploy-colo` | `scripts/deploy-colo.sh` | Delegate de 4 linhas no script de deploy do repo |

## Antes de mexer no SSH

O risco real de desligar palavras-passe é **fechar a porta a quem trabalha**.
Por isso a ordem importa:

```bash
sshd -t                       # 1. validar a sintaxe; se falhar, nada é aplicado
systemctl reload ssh          # 2. reload, NUNCA restart (não corta sessões)
ssh -o PreferredAuthentications=none root@127.0.0.1 true
# 3. a resposta esperada é "Permission denied (publickey)" —
#    prova que o servidor só oferece chave. Se ainda oferecer password
#    ("publickey,password"), a config não foi lida.
```

`/etc/ssh/sshd_config.d/*.conf` é incluído **no topo** do `sshd_config`, e no
OpenSSH vale a primeira directiva encontrada — por isso o que está aí
sobrepõe-se ao `PermitRootLogin yes` do ficheiro principal.

O acesso legítimo é todo por chave, logo nada se perde ao desligar palavras-passe:

| Quem | Chave | Via |
|---|---|---|
| GitHub Actions (deploy) | `colo-github-actions-ci` | `command="/usr/local/bin/deploy-colo"` |
| A dona / administrador | `buto@DESKTOP-KU2PLSU`, `jairobuto03@gmail.com` | shell normal |
| Consola do alojamento | rede `169.254.0.0/16` | fora de banda, não depende do sshd |

## O que ficou resolvido a 2026-09-28

- **Palavras-passe desligadas.** O registo tinha ~1170 tentativas por dia
  contra a conta root, de `183.23.153.29` e `183.23.151.33`. A superfície
  fechou: zero `Failed password` depois do reload.
- **fail2ban activo** (estava inactivo), com `maxretry 4` e ban de 24 h. A regra
  é uma cadeia nftables real no `input`, verificada a disparar e a levantar.
- **Placeholder removido**: a `authorized_keys` tinha a linha
  `CONTEUDO_DO_PUB_KEY`, que nunca foi uma chave válida. Ficou comentada com
  nota, para se a chave real aparecer não se perder o rasto.
- **Cópia da BD** antes de qualquer migração, feita pelo `deploy-colo.sh`.

## Deploy automático: uma nota honesta

O `deploy-colo` foi testado a correr exactamente como o GitHub Actions o
invoca (chave do CI, comando forçado, sem TTY, pela IP pública) e passou.

Mas em 2026-09-28 às 22:13 um run do GitHub Actions **falhou ao abrir a
ligação**: nenhuma ligação chegou ao `sshd` (a porta estava aberta e a chave
continuava autorizada), e o servidor não registou nada. O run anterior, uma
hora antes, tinha funcionado com a mesma configuração. A leitura mais provável
é uma falha de rede transitória entre o runner do GitHub e a VPS.

Se voltar a acontecer, o log do step é a pista — e precisa de acesso de admin
ao repositório para o ler (a API do GitHub devolve 403 sem permissões).
