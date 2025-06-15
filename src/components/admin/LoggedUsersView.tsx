
import { useLoggedUsers } from "@/hooks/use-logged-users";
import { useUsersFiltering } from "@/hooks/use-users-filtering";
import { UsersStatsCards } from "./users/UsersStatsCards";
import { UsersTable } from "./users/UsersTable";

export const LoggedUsersView = () => {
  const { loggedUsers, isLoading } = useLoggedUsers();
  const {
    searchTerm,
    currentPage,
    filteredUsers,
    currentUsers,
    totalPages,
    startIndex,
    endIndex,
    handleSearchChange,
    setCurrentPage
  } = useUsersFiltering(loggedUsers);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UsersStatsCards users={loggedUsers} />
      <UsersTable
        currentUsers={currentUsers}
        filteredUsers={filteredUsers}
        totalUsers={loggedUsers}
        searchTerm={searchTerm}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
        onSearchChange={handleSearchChange}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
