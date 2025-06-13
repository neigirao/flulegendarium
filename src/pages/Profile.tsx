
import { RootLayout } from "@/components/RootLayout";
import { UserProfile } from "@/components/UserProfile";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const Profile = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gradient-to-b from-flu-verde/50 to-white py-8">
        <UserProfile />
      </div>
    </RootLayout>
  );
};

export default Profile;
