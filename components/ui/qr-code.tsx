/**
 * Simple deterministic QR code rendered as SVG.
 * In production, use a proper QR library. This renders a visual placeholder
 * that looks like a real QR code using a grid pattern.
 */
export function QrCode({ url }: { url: string }) {
  // Generate a deterministic pattern from the URL
  const size = 21; // QR version 1 is 21x21
  const cells: boolean[][] = [];

  // Simple hash-based pattern generation
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }

  for (let row = 0; row < size; row++) {
    cells[row] = [];
    for (let col = 0; col < size; col++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const inFinderTL = row < 7 && col < 7;
      const inFinderTR = row < 7 && col >= size - 7;
      const inFinderBL = row >= size - 7 && col < 7;

      if (inFinderTL || inFinderTR || inFinderBL) {
        const localRow = inFinderTL ? row : inFinderTR ? row : row - (size - 7);
        const localCol = inFinderTL ? col : inFinderTR ? col - (size - 7) : col;
        // Finder pattern: outer ring, space, inner square
        const isOuter = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
        const isInner = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
        cells[row][col] = isOuter || isInner;
      } else {
        // Pseudo-random data modules
        const seed = (hash + row * 31 + col * 17) ^ (row * col);
        cells[row][col] = (seed & 3) !== 0; // ~75% fill for visual density
      }
    }
  }

  const cellSize = 100 / size;

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
              rx={cellSize * 0.1}
            />
          ) : null
        )
      )}
    </svg>
  );
}
