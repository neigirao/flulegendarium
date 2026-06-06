import { useState } from 'react';
import { ILFPlayer } from '@/data/maior-atacante';
import { ILF_PHOTOS } from '@/data/ilf-player-photos';

interface PortraitProps {
  player: ILFPlayer;
  size?: number;
  ring?: string;
  big?: boolean;
}

function supabaseTransform(src: string, displaySize: number): string {
  if (!src.includes('supabase.co/storage/v1/object/public/')) return src;
  const w = Math.min(Math.ceil(displaySize * 2), 400);
  return src.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    + `?width=${w}&quality=75&format=webp`;
}

export function Portrait({ player, size = 96, ring = '#C4944A', big }: PortraitProps) {
  const rawSrc = ILF_PHOTOS[player.id];
  const [imgSrc, setImgSrc] = useState(() => rawSrc ? supabaseTransform(rawSrc, size) : rawSrc);
  const [failed, setFailed] = useState(false);
  const showPhoto = !!imgSrc && !failed;

  function handleError() {
    if (rawSrc && imgSrc !== rawSrc) {
      setImgSrc(rawSrc);
    } else {
      setFailed(true);
    }
  }
  const initials = player.nome.split(' ').map(w => w[0]).slice(0, 2).join('');
  const border = big ? 4 : 3;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%', overflow: 'hidden',
        background: 'linear-gradient(160deg, #0D2018 0%, #143026 55%, #0A1810 100%)',
        border: `${border}px solid ${ring}`,
        display: 'flex', alignItems: showPhoto ? 'center' : 'flex-end', justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)', position: 'relative',
      }}>
        {showPhoto ? (
          <img
            src={imgSrc}
            alt={player.nome}
            loading="lazy"
            width={size}
            height={size}
            onError={handleError}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center top',
              display: 'block',
            }}
          />
        ) : (
          <>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%',
              background: 'linear-gradient(90deg,#7A0213 33%,#FAFAFA 33% 66%,#006140 66%)',
              opacity: 0.85,
            }} />
            <span style={{
              fontFamily: "'Bebas Neue', Impact, sans-serif",
              fontSize: size * 0.42, color: 'rgba(255,255,255,0.92)',
              letterSpacing: '0.02em', zIndex: 1, marginBottom: '14%',
            }}>
              {initials}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
