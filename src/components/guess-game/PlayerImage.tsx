
import { memo, useRef, useEffect, useState } from "react";
import { usePlayerImage } from "@/hooks/use-player-image";
import { ImageLoader } from "./ImageLoader";
import { ImageErrorDisplay } from "./ImageErrorDisplay";

interface PlayerImageProps {
  player: {
    id: string;
    name: string;
    image_url: string;
  } | null;
  onImageFixed: () => void;
  onImageLoaded?: () => void;
}

export const PlayerImage = memo(({ player, onImageFixed, onImageLoaded }: PlayerImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);
  const { imageError, isLoading, imageSrc, handleImageError, handleImageLoaded } = 
    usePlayerImage({ player, onImageFixed, onImageLoaded });

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          console.log(`👁️ Imagem entrou na viewport: ${player?.name}`);
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [player?.name]);

  if (!player || !imageSrc) {
    console.warn(`⚠️ Nenhuma imagem disponível para: ${player?.name}`);
    return (
      <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-gray-100 border-2 border-flu-verde flex items-center justify-center">
        <p className="text-gray-500">Imagem não disponível</p>
      </div>
    );
  }

  console.log(`🎨 Renderizando imagem para ${player.name}: ${imageSrc}`);

  return (
    <div className="relative w-full h-[350px] md:h-[450px] rounded-lg overflow-hidden bg-white shadow-md transition-all duration-300 hover:shadow-lg border-2 border-flu-verde">
      <ImageLoader isLoading={isLoading && !imageError} />
      <ImageErrorDisplay imageError={imageError} />
      
      <div className="w-full h-full flex items-center justify-center p-2 relative">
        <img
          ref={imgRef}
          src={imageSrc}
          alt={`Imagem de ${player.name}`}
          className={`max-w-full max-h-full object-contain transition-all duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onError={() => {
            console.error(`🚫 Evento onError para ${player.name}`);
            handleImageError();
          }}
          onLoad={() => {
            console.log(`🎉 Evento onLoad para ${player.name}`);
            handleImageLoaded();
          }}
          loading="lazy" 
          decoding="async"
          referrerPolicy="no-referrer"
          onContextMenu={(e) => e.preventDefault()}
          draggable="false"
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
});

PlayerImage.displayName = 'PlayerImage';
