// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadImage, validatedImageUrl, MAX_IMAGE_BYTES, DOWNLOAD_TIMEOUT_MS } from './safe-image';
const url = 'https://s2.glbimg.com/player.jpg';
const jpeg = new Uint8Array([255,216,255,0]);
const response = (body: BodyInit, headers: Record<string,string> = {}) => new Response(body, { headers: { 'content-type': 'image/jpeg', ...headers } });
afterEach(() => { vi.useRealTimers(); });
describe('image source validation', () => {
  it('allows exact HTTPS source hosts', () => expect(validatedImageUrl(url).hostname).toBe('s2.glbimg.com'));
  it.each(['http://s2.glbimg.com/a','https://s2.glbimg.com.evil.test/a','https://evil.s2.glbimg.com/a','https://s2.glbimg.com@127.0.0.1/a','https://user:pass@s2.glbimg.com/a','https://s2.glbimg.com:8080/a','https://127.0.0.1/a','https://[::1]/a','file:///etc/passwd'])('rejects %s before any fetch', async (input) => {
    const fetcher = vi.fn();
    await expect(downloadImage(input, fetcher)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects non-string and oversized URLs', () => {
    expect(() => validatedImageUrl(null)).toThrow();
    expect(() => validatedImageUrl(url + 'a'.repeat(4096))).toThrow();
  });
});
describe('bounded download', () => {
  it('returns JPEG and enforces redirect:error plus abort signal', async () => {
    const fetcher = vi.fn().mockResolvedValue(response(jpeg));
    const result = await downloadImage(url, fetcher);
    expect(result.bytes).toEqual(jpeg);
    expect(result.extension).toBe('jpg');
    expect(fetcher.mock.calls[0][1].redirect).toBe('error');
    expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
  it('accepts PNG and WebP only with matching signatures', async () => {
    expect((await downloadImage(url, vi.fn().mockResolvedValue(response(new Uint8Array([137,80,78,71,13,10,26,10]), { 'content-type': 'image/png' })))).extension).toBe('png');
    expect((await downloadImage(url, vi.fn().mockResolvedValue(response(new TextEncoder().encode('RIFF0000WEBP'), { 'content-type': 'image/webp' })))).extension).toBe('webp');
  });
  it('rejects redirects even from an injected response', async () => {
    const r = response(jpeg); Object.defineProperty(r, 'redirected', { value: true });
    await expect(downloadImage(url, vi.fn().mockResolvedValue(r))).rejects.toThrow();
  });
  it('rejects non-success responses', async () => {
    await expect(downloadImage(url, vi.fn().mockResolvedValue(new Response('bad', { status: 404 })))).rejects.toThrow();
  });
  it('rejects non-image MIME, SVG and missing MIME', async () => {
    for (const mime of ['text/html','image/svg+xml','']) await expect(downloadImage(url, vi.fn().mockResolvedValue(response(jpeg, { 'content-type': mime })))).rejects.toThrow();
  });
  it('rejects MIME spoofing and empty images', async () => {
    for (const bytes of [new TextEncoder().encode('<html>'), new Uint8Array()]) await expect(downloadImage(url, vi.fn().mockResolvedValue(response(bytes)))).rejects.toThrow();
  });
  it('rejects excessive and invalid declared length', async () => {
    for (const length of [String(MAX_IMAGE_BYTES+1),'invalid']) await expect(downloadImage(url, vi.fn().mockResolvedValue(response(jpeg, { 'content-length': length })))).rejects.toThrow();
  });
  it('enforces streaming limit when length is missing or forged', async () => {
    for (const headers of ([{}, { 'content-length': '4' }] as Record<string,string>[])) {
      let i=0; const canceled=vi.fn();
      const stream=new ReadableStream<Uint8Array>({pull(c) { c.enqueue(new Uint8Array(1024*1024)); ++i; },cancel:canceled});
      await expect(downloadImage(url,vi.fn().mockResolvedValue(response(stream,headers)))).rejects.toThrow('Imagem muito grande');
      expect(canceled).toHaveBeenCalled();
    }
  });
  it('aborts a stalled fetch at the deadline', async () => {
    vi.useFakeTimers();
    const fetcher=vi.fn((_url: unknown,options: RequestInit) => new Promise<Response>((_resolve,reject) => options.signal?.addEventListener('abort',()=>reject(new Error('aborted')))));
    const promise=downloadImage(url,fetcher as typeof fetch);
    const assertion=expect(promise).rejects.toThrow('aborted');
    await vi.advanceTimersByTimeAsync(DOWNLOAD_TIMEOUT_MS);
    await assertion;
  });
});
