import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, X, Filter, SlidersHorizontal } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  placeholder?: string;
}

interface SearchWithFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  filters?: FilterConfig[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onClearFilters?: () => void;
  totalResults?: number;
  totalItems?: number;
  className?: string;
  children?: React.ReactNode;
}

export const SearchWithFilters = ({
  searchTerm,
  onSearchChange,
  placeholder = "Buscar...",
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  totalResults,
  totalItems,
  className,
  children
}: SearchWithFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(v => v && v !== 'all').length;
  }, [activeFilters]);

  const hasActiveFilters = activeFilterCount > 0 || searchTerm.length > 0;

  const handleClearAll = useCallback(() => {
    onSearchChange('');
    onClearFilters?.();
  }, [onSearchChange, onClearFilters]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search bar with filter toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {filters.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <SlidersHorizontal size={18} />
                  {activeFilterCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filtros {activeFilterCount > 0 ? `(${activeFilterCount} ativos)` : ''}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {children}
      </div>

      {/* Filters panel */}
      {filters.length > 0 && (
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="space-y-3">
            <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg border">
              {filters.map((filter) => (
                <div key={filter.key} className="flex-1 min-w-[150px]">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {filter.label}
                  </label>
                  <Select
                    value={activeFilters[filter.key] || 'all'}
                    onValueChange={(value) => onFilterChange?.(filter.key, value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={filter.placeholder || `Todos`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {filter.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Active filters badges and results count */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <>
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Busca: "{searchTerm}"
                  <button onClick={() => onSearchChange('')} className="ml-1 hover:text-foreground">
                    <X size={12} />
                  </button>
                </Badge>
              )}
              {Object.entries(activeFilters).map(([key, value]) => {
                if (!value || value === 'all') return null;
                const filter = filters.find(f => f.key === key);
                const option = filter?.options.find(o => o.value === value);
                return (
                  <Badge key={key} variant="secondary" className="gap-1">
                    {filter?.label}: {option?.label || value}
                    <button 
                      onClick={() => onFilterChange?.(key, 'all')} 
                      className="ml-1 hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                );
              })}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearAll}
                className="h-6 px-2 text-xs text-muted-foreground"
              >
                Limpar tudo
              </Button>
            </>
          )}
        </div>
        
        {typeof totalResults === 'number' && typeof totalItems === 'number' && (
          <span className="text-sm text-muted-foreground">
            {totalResults === totalItems 
              ? `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`
              : `${totalResults} de ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`
            }
          </span>
        )}
      </div>
    </div>
  );
};

export default SearchWithFilters;
