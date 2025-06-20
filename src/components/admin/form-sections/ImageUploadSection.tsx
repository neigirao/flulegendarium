
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link } from "lucide-react";

interface ImageUploadSectionProps {
  uploadMethod: 'file' | 'url';
  onUploadMethodChange: (value: 'file' | 'url') => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  onImageFileChange: (file: File | null) => void;
  isLoading: boolean;
}

export const ImageUploadSection = ({
  uploadMethod,
  onUploadMethodChange,
  imageUrl,
  onImageUrlChange,
  onImageFileChange,
  isLoading
}: ImageUploadSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Imagem do Jogador</Label>
      <Tabs value={uploadMethod} onValueChange={(value) => onUploadMethodChange(value as 'file' | 'url')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <Upload size={16} />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link size={16} />
            URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onImageFileChange(e.target.files?.[0] || null)}
            disabled={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="url" className="space-y-2">
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            disabled={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
