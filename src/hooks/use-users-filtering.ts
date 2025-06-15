
import { useState, useMemo } from "react";

interface LoggedUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  total_games: number;
  best_score: number;
  last_played: string;
  total_attempts: number;
  correct_guesses: number;
  accuracy_rate: number;
}

const ITEMS_PER_PAGE = 15;

export const useUsersFiltering = (users: LoggedUser[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return {
    searchTerm,
    currentPage,
    filteredUsers,
    currentUsers,
    totalPages,
    startIndex,
    endIndex,
    handleSearchChange,
    setCurrentPage
  };
};
