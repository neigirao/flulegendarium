import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface NewsSearchProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

export const NewsSearch = ({ onSearch, searchTerm }: NewsSearchProps) => {
  const [inputValue, setInputValue] = useState(searchTerm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputValue);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Buscar notícias..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="bg-background/90 backdrop-blur-sm border-border placeholder:text-muted-foreground"
        />
        <Button 
          type="submit"
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};