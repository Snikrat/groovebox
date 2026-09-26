const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;
const PADDING = 80;
const COVER_SIZE = 640;

const STAR_PATH = new Path2D(
  'M12 2.6l2.9 6.1 6.7.8-4.9 4.6 1.3 6.6L12 17.4l-6 3.3 1.3-6.6-4.9-4.6 6.7-.8z',
);

export interface ShareCardData {
  title: string;
  artistName: string;
  coverUrl: string | null;
  rating: number;
  reviewText: string | null;
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  // Se sobrou texto além do que coube, adiciona reticências na última linha.
  const consumed = lines.join(' ').length;
  if (consumed < text.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 0) {
      last = last.slice(0, -1).trimEnd();
    }
    lines[lines.length - 1] = `${last}…`;
  }

  return lines;
}

function drawStars(ctx: CanvasRenderingContext2D, x: number, y: number, rating: number) {
  const size = 44;
  const gap = 10;

  for (let star = 0; star < 5; star++) {
    const starX = x + star * (size + gap);
    const fill = Math.min(1, Math.max(0, rating - star));

    ctx.save();
    ctx.translate(starX, y);
    ctx.scale(size / 24, size / 24);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fill(STAR_PATH);

    if (fill > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, 24 * fill, 24);
      ctx.clip();
      ctx.fillStyle = '#e0552b';
      ctx.fill(STAR_PATH);
      ctx.restore();
    }

    ctx.restore();
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Falha ao carregar a capa.'));
    image.src = url;
  });
}

/** Desenha a capa recortada em cover-fit dentro de um quadrado. */
function drawCoverImage(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, size: number) {
  const scale = Math.max(size / image.width, size / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, x + (size - drawWidth) / 2, y + (size - drawHeight) / 2, drawWidth, drawHeight);
}

function drawPlaceholderCover(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, '#3a372f');
  gradient.addColorStop(1, '#2a281f');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, size, size);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 3;
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.13, 0, Math.PI * 2);
  ctx.globalAlpha = 0.5;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.045, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();
}

export async function drawShareCard(canvas: HTMLCanvasElement, data: ShareCardData): Promise<void> {
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas não suportado.');

  // Garante que as fontes já usadas na página estejam prontas antes de desenhar texto.
  await Promise.all([
    document.fonts.load('600 56px Fraunces'),
    document.fonts.load('500 32px Inter'),
    document.fonts.load('400 34px Inter'),
  ]).catch(() => undefined);

  const background = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  background.addColorStop(0, '#211e16');
  background.addColorStop(1, '#15130d');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  const coverX = (CARD_WIDTH - COVER_SIZE) / 2;
  const coverY = PADDING;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  try {
    if (data.coverUrl) {
      const image = await loadImage(data.coverUrl);
      drawCoverImage(ctx, image, coverX, coverY, COVER_SIZE);
    } else {
      drawPlaceholderCover(ctx, coverX, coverY, COVER_SIZE);
    }
  } catch {
    drawPlaceholderCover(ctx, coverX, coverY, COVER_SIZE);
  }
  ctx.restore();

  let cursorY = coverY + COVER_SIZE + 70;
  const textX = PADDING;
  const maxTextWidth = CARD_WIDTH - PADDING * 2;

  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#e0552b';
  ctx.font = '600 26px Inter, sans-serif';
  ctx.fillText('AVALIADO NO GROOVEBOX', textX, cursorY);
  cursorY += 56;

  ctx.fillStyle = '#f7f5f0';
  ctx.font = '600 56px Fraunces, Georgia, serif';
  const titleLines = wrapText(ctx, data.title, maxTextWidth, 2);
  for (const line of titleLines) {
    ctx.fillText(line, textX, cursorY);
    cursorY += 64;
  }
  cursorY += 4;

  ctx.fillStyle = 'rgba(247, 245, 240, 0.7)';
  ctx.font = '400 34px Inter, sans-serif';
  ctx.fillText(data.artistName, textX, cursorY);
  cursorY += 56;

  drawStars(ctx, textX, cursorY, data.rating);
  cursorY += 76;

  if (data.reviewText) {
    ctx.fillStyle = 'rgba(247, 245, 240, 0.85)';
    ctx.font = '400 32px Inter, sans-serif';
    const reviewLines = wrapText(ctx, `"${data.reviewText}"`, maxTextWidth, 4);
    for (const line of reviewLines) {
      ctx.fillText(line, textX, cursorY);
      cursorY += 44;
    }
  }

  // Rodapé
  ctx.fillStyle = 'rgba(247, 245, 240, 0.5)';
  ctx.font = '600 28px Fraunces, Georgia, serif';
  ctx.fillText('groovebox', textX, CARD_HEIGHT - 56);
}
