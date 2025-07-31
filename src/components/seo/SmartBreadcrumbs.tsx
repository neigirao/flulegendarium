import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartBreadcrumbsProps {
  className?: string;
}

// Route mapping for breadcrumb navigation
const ROUTE_LABELS = {
  '/': 'Início',
  '/selecionar-modo-jogo': 'Modos de Jogo',
  '/quiz-adaptativo': 'Quiz Adaptativo',
  '/quiz-decada': 'Quiz por Década',
  '/faq': 'Perguntas Frequentes',
  '/noticias': 'Notícias',
  '/social': 'Social',
  '/doacoes': 'Doações',
  '/admin': 'Administração'
};

export const SmartBreadcrumbs = ({ className }: SmartBreadcrumbsProps) => {
  const location = useLocation();
  
  // Don't show breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  // Generate breadcrumb items
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = [
    { label: 'Início', path: '/', current: false }
  ];

  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;
    const label = ROUTE_LABELS[currentPath as keyof typeof ROUTE_LABELS] || 
                  segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    breadcrumbItems.push({
      label,
      path: currentPath,
      current: isLast
    });
  });

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('py-2', className)}
    >
      <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground/60" />
            )}
            
            {item.current ? (
              <span 
                className="font-medium text-foreground"
                aria-current="page"
              >
                {index === 0 && <Home className="w-4 h-4 mr-1 inline" />}
                {item.label}
              </span>
            ) : (
              <a
                href={item.path}
                className="hover:text-foreground transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', item.path);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
              >
                {index === 0 && <Home className="w-4 h-4 mr-1 inline" />}
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
      
      {/* Structured data for breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.label,
              "item": `https://flulegendarium.lovable.app${item.path}`
            }))
          })
        }}
      />
    </nav>
  );
};