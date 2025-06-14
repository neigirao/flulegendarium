
// Global type declarations for the application

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    __vitePreload?: (moduleId: string, ...args: any[]) => Promise<any>;
  }
}

export {};
