
interface ImageErrorDisplayProps {
  imageError: boolean;
}

export const ImageErrorDisplay = ({ imageError }: ImageErrorDisplayProps) => {
  if (!imageError) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80 z-10">
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <p className="text-flu-grena font-medium">Não foi possível carregar a imagem</p>
        <p className="text-sm text-gray-600">Prossiga com o jogo normalmente</p>
      </div>
    </div>
  );
};
