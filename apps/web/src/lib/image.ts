const SUPPORTED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

/**
 * Redimensiona e reencodifica a imagem no browser antes do upload, mantendo o
 * mesmo formato. Reduz drasticamente o tempo de envio em fotos tiradas por
 * telemóvel (normalmente 3-6 MB) sem perda visível de qualidade — o formulário
 * web nunca precisa de mais do que ~1920px no lado maior.
 */
export async function compressImage(
  file: File,
  opts: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  const { maxDimension = 1920, quality = 0.85 } = opts;
  if (!SUPPORTED_MIME.has(file.type)) return file; // gif/outros: enviar tal como está

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 350 * 1024) {
      bitmap.close();
      return file; // já é pequena, não vale a pena reencodificar
    }

    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, quality));
    if (!blob || blob.size >= file.size) return file; // manter original se não compensou

    return new File([blob], file.name, { type: file.type });
  } catch {
    return file; // qualquer falha: envia o ficheiro original
  }
}
