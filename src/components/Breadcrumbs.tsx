
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs based on route if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Início', href: '/' }
    ];

    const routeMap: Record<string, string> = {
      'select-mode': 'Selecionar Modo',
      'game': 'Jogar Quiz',
      'profile': 'Meu Perfil',
      'admin': 'Admin',
      'login': 'Login'
    };

    pathnames.forEach((pathname, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`;
      const label = routeMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
      const current = index === pathnames.length - 1;
      
      breadcrumbs.push({ label, href, current });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
            )}
            {item.current ? (
              <span className="text-flu-grena font-medium" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                to={item.href} 
                className="text-flu-verde hover:text-flu-grena transition-colors flex items-center gap-1"
              >
                {index === 0 && <Home className="w-4 h-4" />}
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
