
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DebugInfoProps {
  show: boolean;
  imageUrl?: string;
}

export const DebugInfo = ({ show, imageUrl }: DebugInfoProps) => {
  if (!show || !imageUrl) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Alert className="mb-4">
            <AlertTitle>Debug Info</AlertTitle>
            <AlertDescription className="text-xs truncate">
              URL da imagem: {imageUrl}
            </AlertDescription>
          </Alert>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Clique para copiar</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
