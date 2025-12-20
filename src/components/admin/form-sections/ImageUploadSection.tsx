import { PlayerImageUpload } from "../players/PlayerImageUpload";

interface ImageUploadSectionProps {
  uploadMethod: 'file' | 'url';
  onUploadMethodChange: (value: 'file' | 'url') => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  onImageFileChange: (file: File | null) => void;
  isLoading: boolean;
}

export const ImageUploadSection = ({
  imageUrl,
  onImageUrlChange,
  onImageFileChange,
  isLoading
}: ImageUploadSectionProps) => {
  return (
    <PlayerImageUpload
      imageUrl={imageUrl}
      onImageUrlChange={onImageUrlChange}
      onImageFileChange={onImageFileChange}
      disabled={isLoading}
    />
  );
};
