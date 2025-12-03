'use client';

const PIXEL_LETTERS: Record<string, number[][]> = {
  D: [
    [1,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,0],
  ],
  R: [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,1,0],
    [1,0,0,1],
  ],
  O: [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  I: [
    [1,1,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [1,1,1],
  ],
  M: [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  A: [
    [0,1,1,0],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  S: [
    [0,1,1,1],
    [1,0,0,0],
    [0,1,1,0],
    [0,0,0,1],
    [1,1,1,0],
  ],
};

function PixelLetter({ letter, pixelSize = 10 }: { letter: string; pixelSize?: number }) {
  const grid = PIXEL_LETTERS[letter] || [];
  const gap = Math.max(1, Math.floor(pixelSize / 5));
  
  return (
    <div className="inline-flex flex-col" style={{ gap: `${gap}px` }}>
      {grid.map((row, y) => (
        <div key={y} className="flex" style={{ gap: `${gap}px` }}>
          {row.map((cell, x) => (
            <div
              key={x}
              style={{
                width: `${pixelSize}px`,
                height: `${pixelSize}px`,
                backgroundColor: cell ? '#d56a26' : 'transparent',
                boxShadow: cell ? '0 0 8px rgba(213, 106, 38, 0.5)' : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface PixelLogoProps {
  pixelSize?: number;
  className?: string;
}

export function PixelLogo({ pixelSize = 10, className = '' }: PixelLogoProps) {
  const gap = Math.max(2, Math.floor(pixelSize / 3));
  
  return (
    <div className={`flex items-end ${className}`} style={{ gap: `${gap}px` }}>
      {'DROIDMAS'.split('').map((letter, i) => (
        <PixelLetter key={i} letter={letter} pixelSize={pixelSize} />
      ))}
    </div>
  );
}

export function PixelLogoSmall({ className = '' }: { className?: string }) {
  return <PixelLogo pixelSize={3} className={className} />;
}

export function PixelLogoLarge({ className = '' }: { className?: string }) {
  return <PixelLogo pixelSize={8} className={className} />;
}
