
import { lazy, Suspense } from 'react';
import { Loader } from 'lucide-react';

const AdminDashboard = lazy(() => 
  import('@/components/admin/AdminDashboard').then(module => ({
    default: module.AdminDashboard
  }))
);

const AdminLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-secondary/50 to-white">
    <div className="flex flex-col items-center gap-4">
      <Loader className="w-8 h-8 text-primary animate-spin" />
      <p className="text-primary">Carregando painel administrativo...</p>
    </div>
  </div>
);

export default function AdminLazy() {
  return (
    <Suspense fallback={<AdminLoader />}>
      <AdminDashboard />
    </Suspense>
  );
}
