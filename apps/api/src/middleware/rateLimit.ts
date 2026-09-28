import type { NextFunction, Request, Response } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  /** Duração da janela, em milissegundos. */
  windowMs: number;
  /** Pedidos permitidos dentro da janela. */
  max: number;
  /** Mensagem devolvida (JSON) quando o limite é excedido. */
  message: string;
  /**
   * Identifica o cliente. Por omissão usa `req.ip`, que só é fiável porque
   * `app.ts` declara `trust proxy` — o tráfego chega do Caddy, portanto sem
   * isso todos os pedidos partilhariam um único balde.
   */
  key?: (req: Request) => string;
}

/** Limite a 5000 identidades antes de purgar os baldes expirados. */
const MAX_BUCKETS = 5000;

/**
 * Limitador de tentativas em memória, por processo.
 *
 * Adequado ao deploy actual (uma única instância da API, tráfego baixo): não
 * acrescenta dependências nem migrações. Reiniciar o contentor limpa os
 * contadores, o que no pior caso dá ao atacante uma janela nova.
 *
 * Se a API passar a correr com mais do que uma réplica, trocar por um store
 * partilhado (Redis ou uma tabela com limpeza) antes de confiar neste limite.
 */
export function rateLimit({ windowMs, max, message, key }: RateLimitOptions) {
  const buckets = new Map<string, Bucket>();
  const identify = key ?? ((req: Request) => req.ip ?? "desconhecido");

  return (req: Request, res: Response, next: NextFunction) => {
    const agora = Date.now();
    const id = identify(req);

    let bucket = buckets.get(id);
    if (!bucket || bucket.resetAt <= agora) {
      bucket = { count: 0, resetAt: agora + windowMs };
      buckets.set(id, bucket);
    }
    bucket.count += 1;

    // Purga oportunista: sem isto, um atacante com IPs rotativos faria o Map
    // crescer sem limite ao longo da vida do processo.
    if (buckets.size > MAX_BUCKETS) {
      for (const [chave, b] of buckets) {
        if (b.resetAt <= agora) buckets.delete(chave);
      }
    }

    const segundos = Math.max(1, Math.ceil((bucket.resetAt - agora) / 1000));
    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
    res.setHeader("RateLimit-Reset", String(segundos));

    if (bucket.count > max) {
      res.setHeader("Retry-After", String(segundos));
      res.status(429).json({ erro: message });
      return;
    }

    next();
  };
}
