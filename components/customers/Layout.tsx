// app/components/Layout.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LayoutDashboard, Users, FileText, Settings, Bell, Moon, Sun, Search, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-neutral-light-bg dark:bg-neutral-dark-bg flex">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-neutral-light-border dark:border-neutral-dark-border bg-white dark:bg-neutral-dark-surface fixed inset-y-0 z-30">
        <div className="h-16 flex items-center px-6 border-b border-neutral-light-border dark:border-neutral-dark-border">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <span className="text-lg font-bold text-neutral-light-heading dark:text-neutral-dark-heading tracking-tight">ComplianceGuard</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-brand-green/10 text-brand-green dark:text-brand-green-light"
            aria-current="page"
          >
            <Users className="w-5 h-5 mr-3" />
            Customers
          </button>
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            <FileText className="w-5 h-5 mr-3" />
            Audit Logs
          </button>
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-light-border dark:border-neutral-dark-border">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden">
              <Image
                src="https://ui-avatars.com/api/?name=Admin+User&background=3b5a65&color=fff"
                alt="Admin User"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-light-heading dark:text-neutral-dark-heading">Sarah Admin</p>
              <p className="text-xs text-neutral-light-text dark:text-neutral-dark-text">Senior Compliance</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-dark-surface border-r border-neutral-light-border dark:border-neutral-dark-border transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-light-border dark:border-neutral-dark-border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-lg font-bold text-neutral-light-heading dark:text-neutral-dark-heading tracking-tight">ComplianceGuard</span>
          </div>
          <button 
            onClick={closeMobileMenu}
            className="p-2 text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg rounded-md"
            aria-label="Close menu"
          >
            <Menu className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg bg-brand-green/10 text-brand-green dark:text-brand-green-light"
            aria-current="page"
          >
            <Users className="w-5 h-5 mr-3" />
            Customers
          </button>
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            <FileText className="w-5 h-5 mr-3" />
            Audit Logs
          </button>
          <button 
            onClick={closeMobileMenu}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg hover:text-brand-green dark:hover:text-brand-green transition-colors"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-neutral-light-border dark:border-neutral-dark-border">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full overflow-hidden">
              <Image
                src="https://ui-avatars.com/api/?name=Admin+User&background=3b5a65&color=fff"
                alt="Admin User"
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-light-heading dark:text-neutral-dark-heading">Sarah Admin</p>
              <p className="text-xs text-neutral-light-text dark:text-neutral-dark-text">Senior Compliance</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-neutral-dark-surface border-b border-neutral-light-border dark:border-neutral-dark-border flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20">
          <button 
            className="md:hidden p-2 rounded-md text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
           
          <div className="flex-1 flex justify-center md:justify-start px-4">
            <div className="w-full max-w-lg relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-neutral-light-text dark:text-neutral-dark-text" aria-hidden="true" />
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-md leading-5 bg-neutral-light-bg dark:bg-neutral-dark-bg text-neutral-light-heading dark:text-neutral-dark-heading placeholder-neutral-light-text dark:placeholder-neutral-dark-text focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-brand-green/50 focus:border-transparent sm:text-sm transition-colors"
                placeholder="Global search..." 
                aria-label="Global search"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-full text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-neutral-dark-surface" aria-label="1 unread notification"></span>
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-neutral-light-text dark:text-neutral-dark-text hover:bg-neutral-light-bg dark:hover:bg-neutral-dark-bg transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};