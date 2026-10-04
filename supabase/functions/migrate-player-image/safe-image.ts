// Exact source hosts used by collect-players-data. No wildcard/subdomain matching.
export const IMAGE_HOSTS = new Set([
  'tntsports.com.br', 's2.glbimg.com', 'www.ofutebolero.com.br',
  'assets.goal.com', 'pbs.twimg.com', 'sportbuzz.uol.com.br',
  'www.estadao.com.br', 'diariodonordeste.verdesmares.com.br',
  'images.futebolinterior.com.br',
]);
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const DOWNLOAD_TIMEOUT_MS = 10_000;

export function validatedImageUrl(input: unknown): URL {
  if (typeof input !== 'string' || input.length > 4096) throw new Error('URL inválida');
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password ||
      (url.port && url.port !== '443') || !IMAGE_HOSTS.has(url.hostname)) {
    throw new Error('Domínio da imagem não permitido');
  }
  return url;
}

export async function downloadImage(input: unknown, fetcher: typeof fetch = fetch) {
  const url = validatedImageUrl(input);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    const response = await fetcher(url.href, {
      redirect: 'error', signal: controller.signal,
      headers: { 'User-Agent': 'LendasImageMigration/1.0' },
    });
    if (!response.ok || response.redirected) throw new Error('Falha ao baixar imagem');
    const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    const extension = ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' } as Record<string, string>)[contentType];
    if (!extension) throw new Error('Tipo de imagem não permitido');
    const length = response.headers.get('content-length');
    if (length && (!/^\d+$/.test(length) || Number(length) > MAX_IMAGE_BYTES)) throw new Error('Imagem muito grande');
    if (!response.body) throw new Error('Imagem vazia');
    reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_IMAGE_BYTES) throw new Error('Imagem muito grande');
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const jpeg = size >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = size >= 8 && [137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n);
    const webp = size >= 12 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
    if (!(extension === 'jpg' ? jpeg : extension === 'png' ? png : webp)) throw new Error('Conteúdo da imagem inválido');
    return { bytes, contentType, extension };
  } finally {
    clearTimeout(timer);
    await reader?.cancel().catch(() => undefined);
    controller.abort();
  }
}
