
import { Loader } from "lucide-react";
import { memo } from "react";

interface ImageLoaderProps {
  isLoading: boolean;
}

export const ImageLoader = memo(({ isLoading }: ImageLoaderProps) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm z-10">
      <div className="flex flex-col items-center gap-2">
        <Loader className="w-8 h-8 text-flu-grena animate-spin" />
        <p className="text-sm text-gray-600 animate-pulse">Carregando imagem...</p>
      </div>
    </div>
  );
});

ImageLoader.displayName = 'ImageLoader';
