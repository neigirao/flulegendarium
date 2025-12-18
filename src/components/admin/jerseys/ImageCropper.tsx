import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Crop as CropIcon, RotateCcw, ZoomIn, Check, X, ImageDown } from "lucide-react";

interface ImageCropperProps {
  imageSrc: string;
  fileName: string;
  onCropComplete: (croppedBlob: Blob, croppedFile: File) => void;
  onCancel: () => void;
  open: boolean;
}

const MAX_OUTPUT_SIZE = 1200; // Max dimension for output image
const MIN_OUTPUT_SIZE = 200;  // Min dimension for output image

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

export const ImageCropper = ({
  imageSrc,
  fileName,
  onCropComplete,
  onCancel,
  open,
}: ImageCropperProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [scale, setScale] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const [quality, setQuality] = useState(80);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }, []);

  const handleCrop = async () => {
    if (!imgRef.current || !crop) return;

    setIsProcessing(true);

    try {
      const image = imgRef.current;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelCrop = {
        x: (crop.x / 100) * image.width * scaleX,
        y: (crop.y / 100) * image.height * scaleY,
        width: (crop.width / 100) * image.width * scaleX,
        height: (crop.height / 100) * image.height * scaleY,
      };

      // Calculate output size (maintain aspect ratio, max 1200px)
      let outputWidth = pixelCrop.width;
      let outputHeight = pixelCrop.height;

      if (outputWidth > MAX_OUTPUT_SIZE || outputHeight > MAX_OUTPUT_SIZE) {
        if (outputWidth > outputHeight) {
          outputHeight = (outputHeight * MAX_OUTPUT_SIZE) / outputWidth;
          outputWidth = MAX_OUTPUT_SIZE;
        } else {
          outputWidth = (outputWidth * MAX_OUTPUT_SIZE) / outputHeight;
          outputHeight = MAX_OUTPUT_SIZE;
        }
      }

      // Ensure minimum size
      if (outputWidth < MIN_OUTPUT_SIZE && outputHeight < MIN_OUTPUT_SIZE) {
        const scaleFactor = MIN_OUTPUT_SIZE / Math.min(outputWidth, outputHeight);
        outputWidth *= scaleFactor;
        outputHeight *= scaleFactor;
      }

      canvas.width = Math.round(outputWidth);
      canvas.height = Math.round(outputHeight);

      // Apply scale transform
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // Convert to blob with adjustable quality
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = fileName.split(".").pop() || "jpg";
            const newFileName = `cropped-${Date.now()}.${ext}`;
            const file = new File([blob], newFileName, { type: blob.type });
            onCropComplete(blob, file);
          }
          setIsProcessing(false);
        },
        "image/jpeg",
        quality / 100
      );
    } catch (error) {
      console.error("Error cropping image:", error);
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setScale(1);
    setAspect(undefined);
    setQuality(80);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, 1));
    }
  };

  const handleAspectChange = (newAspect: number | undefined) => {
    setAspect(newAspect);
    if (imgRef.current && newAspect) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, newAspect));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CropIcon size={20} />
            Recortar Imagem
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Aspect Ratio Options */}
          <div className="flex flex-wrap gap-2">
            <Label className="w-full text-sm text-muted-foreground">Proporção:</Label>
            <Button
              type="button"
              size="sm"
              variant={aspect === undefined ? "default" : "outline"}
              onClick={() => handleAspectChange(undefined)}
            >
              Livre
            </Button>
            <Button
              type="button"
              size="sm"
              variant={aspect === 1 ? "default" : "outline"}
              onClick={() => handleAspectChange(1)}
            >
              1:1
            </Button>
            <Button
              type="button"
              size="sm"
              variant={aspect === 4 / 3 ? "default" : "outline"}
              onClick={() => handleAspectChange(4 / 3)}
            >
              4:3
            </Button>
            <Button
              type="button"
              size="sm"
              variant={aspect === 3 / 4 ? "default" : "outline"}
              onClick={() => handleAspectChange(3 / 4)}
            >
              3:4
            </Button>
          </div>

          {/* Zoom Control */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <ZoomIn size={16} />
              Zoom: {Math.round(scale * 100)}%
            </Label>
            <Slider
              value={[scale]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={([value]) => setScale(value)}
              className="w-full"
            />
          </div>

          {/* Quality Control */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <ImageDown size={16} />
              Qualidade: {quality}%
              <span className="text-xs ml-2">
                ({quality >= 90 ? 'Alta' : quality >= 70 ? 'Média' : 'Baixa'})
              </span>
            </Label>
            <Slider
              value={[quality]}
              min={60}
              max={100}
              step={5}
              onValueChange={([value]) => setQuality(value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Menor qualidade = arquivo menor. Recomendado: 70-85% para web.
            </p>
          </div>

          {/* Crop Area */}
          <div className="flex justify-center bg-muted/30 rounded-lg p-4 overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              aspect={aspect}
              className="max-h-[400px]"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Imagem para recortar"
                style={{ transform: `scale(${scale})` }}
                onLoad={onImageLoad}
                className="max-h-[400px] object-contain"
              />
            </ReactCrop>
          </div>

          {/* Size Info */}
          {crop && (
            <p className="text-xs text-muted-foreground text-center">
              Área selecionada: {Math.round(crop.width)}% x {Math.round(crop.height)}% 
              • Saída máxima: {MAX_OUTPUT_SIZE}px
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isProcessing}
          >
            <RotateCcw size={16} className="mr-2" />
            Resetar
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isProcessing}
          >
            <X size={16} className="mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            disabled={isProcessing || !crop}
          >
            <Check size={16} className="mr-2" />
            {isProcessing ? "Processando..." : "Aplicar Recorte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
