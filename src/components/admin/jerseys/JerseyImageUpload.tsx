import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, X, CheckCircle, Crop } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ImageCropper } from "./ImageCropper";

interface JerseyImageUploadProps {
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  disabled?: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const JerseyImageUpload = ({ 
  imageUrl, 
  onImageUrlChange, 
  disabled 
}: JerseyImageUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadMethod, setUploadMethod] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Crop states
  const [showCropper, setShowCropper] = useState(false);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('');

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.';
    }
    if (file.size > MAX_SIZE) {
      return 'Arquivo muito grande. Máximo permitido: 10MB.';
    }
    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error,
      });
      return;
    }

    // Open cropper with the selected file
    const imageSrc = URL.createObjectURL(file);
    setOriginalImageSrc(imageSrc);
    setOriginalFileName(file.name);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedBlob: Blob, croppedFile: File) => {
    // Clean up original image URL
    if (originalImageSrc) {
      URL.revokeObjectURL(originalImageSrc);
    }
    
    setSelectedFile(croppedFile);
    const preview = URL.createObjectURL(croppedBlob);
    setPreviewUrl(preview);
    setShowCropper(false);
    setOriginalImageSrc(null);
    
    toast({
      title: "Imagem recortada!",
      description: `Tamanho otimizado: ${(croppedBlob.size / 1024).toFixed(0)} KB`,
    });
  };

  const handleCropCancel = () => {
    if (originalImageSrc) {
      URL.revokeObjectURL(originalImageSrc);
    }
    setShowCropper(false);
    setOriginalImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `jersey-${Date.now()}.${fileExt}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const { error: uploadError } = await supabase.storage
        .from('jerseys')
        .upload(fileName, selectedFile, { 
          upsert: true,
          contentType: selectedFile.type,
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('jerseys')
        .getPublicUrl(fileName);

      setUploadProgress(100);
      onImageUrlChange(publicUrl);

      toast({
        title: "Sucesso!",
        description: "Imagem enviada com sucesso!",
      });

      // Clear selected file after successful upload
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: "Falha ao enviar imagem. Tente novamente.",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReCrop = () => {
    if (!selectedFile) return;
    const imageSrc = URL.createObjectURL(selectedFile);
    setOriginalImageSrc(imageSrc);
    setOriginalFileName(selectedFile.name);
    setShowCropper(true);
  };

  const displayUrl = previewUrl || imageUrl;

  return (
    <div className="space-y-4">
      <Label>Imagem da Camisa *</Label>
      
      <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as 'upload' | 'url')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={16} />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link size={16} />
            URL Externa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />
            
            {selectedFile ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="text-success" size={20} />
                  <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFile}
                    disabled={isUploading}
                  >
                    <X size={16} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(0)} KB (otimizado)
                </p>
                
                {isUploading ? (
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enviando... {uploadProgress}%
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReCrop}
                      disabled={disabled}
                    >
                      <Crop size={16} className="mr-2" />
                      Recortar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={disabled}
                    >
                      <Upload size={16} className="mr-2" />
                      Enviar
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="mx-auto text-muted-foreground" size={40} />
                <div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isUploading}
                  >
                    Selecionar Arquivo
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  JPEG, PNG, WebP ou GIF • Máx. 10MB
                </p>
                <p className="text-xs text-muted-foreground">
                  Você poderá recortar e redimensionar a imagem antes do upload
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://..."
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            ⚠️ URLs externas podem não funcionar devido a proteção hotlink. 
            Prefira fazer upload direto para maior confiabilidade.
          </p>
        </TabsContent>
      </Tabs>

      {/* Preview */}
      {displayUrl && (
        <div className="mt-4">
          <Label className="text-sm text-muted-foreground mb-2 block">Preview</Label>
          <div className="relative inline-block">
            <img 
              src={displayUrl} 
              alt="Preview da camisa" 
              className="max-h-48 rounded-lg border border-border object-contain bg-muted/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png';
              }}
            />
            {imageUrl && (
              <div className="absolute -top-2 -right-2">
                <div className="bg-success text-success-foreground rounded-full p-1">
                  <CheckCircle size={16} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {originalImageSrc && (
        <ImageCropper
          imageSrc={originalImageSrc}
          fileName={originalFileName}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          open={showCropper}
        />
      )}
    </div>
  );
};
