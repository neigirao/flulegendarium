
import { useState } from "react";
import { usePlayersData } from "@/hooks/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Search, Users, Trophy, Target } from "lucide-react";
import { Player } from "@/types/guess-game";

const ITEMS_PER_PAGE = 15;

export const PlayersListView = () => {
  const { players, isLoading } = usePlayersData();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter players based on search term
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nicknames?.some(nick => 
      nick.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Jogadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atacantes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {players.filter(p => p.position.toLowerCase().includes('atacante')).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Apelidos</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {players.filter(p => p.nicknames && p.nicknames.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader>
          <CardTitle>Jogadores Cadastrados</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar por nome, posição ou apelido..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum jogador encontrado para a busca.' : 'Nenhum jogador cadastrado.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Foto</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Posição</TableHead>
                    <TableHead>Apelidos</TableHead>
                    <TableHead>Gols</TableHead>
                    <TableHead>Jogos</TableHead>
                    <TableHead>Ano Destaque</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell>
                        <img
                          src={player.image_url}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png';
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{player.name}</TableCell>
                      <TableCell>{player.position}</TableCell>
                      <TableCell>
                        {player.nicknames && player.nicknames.length > 0 
                          ? player.nicknames.join(', ') 
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{player.statistics?.gols || 0}</TableCell>
                      <TableCell>{player.statistics?.jogos || 0}</TableCell>
                      <TableCell>{player.year_highlight || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500 text-center">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredPlayers.length)} de {filteredPlayers.length} jogadores
                {searchTerm && ` (filtrados de ${players.length} total)`}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
