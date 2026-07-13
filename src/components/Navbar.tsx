import React, { useState } from 'react';
import { Compass, BookOpen, Users, Search, Menu, X, Lock, Settings, LogOut, Heart } from 'lucide-react';
import { ThemeSettings } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';

interface NavbarProps {
  settings: ThemeSettings;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export default function Navbar({
  settings,
  currentTab,
  setCurrentTab,
  isAdmin,
  onLogout,
  onOpenLogin
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'blog', label: 'Explore', icon: BookOpen },
    { id: 'authors', label: 'Authors', icon: Users },
  ];

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              id="nav-logo-btn"
              onClick={() => handleTabChange('home')}
              className="flex items-center space-x-2 text-slate-950 font-serif font-bold text-xl group cursor-pointer"
            >
              <div className={`p-1.5 rounded-lg ${palette.lightBg} ${palette.primaryText} transition-all duration-300 group-hover:rotate-12`}>
                <Compass className="w-5 h-5" />
              </div>
              <span className={`${fonts.titleFont} tracking-tight`}>
                {settings.siteName || 'Travel Bee'}
              </span>
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  id={`nav-item-desktop-${item.id}`}
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? `${palette.lightBg} ${palette.primaryText}` 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin trigger */}
            {isAdmin ? (
              <div className="flex items-center space-x-2 border-l pl-4 border-slate-200">
                <button
                  id="nav-admin-dashboard"
                  onClick={() => handleTabChange('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  id="nav-logout"
                  onClick={onLogout}
                  title="Logout Admin"
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-trigger"
                onClick={onOpenLogin}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer transition-all duration-200"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Editor Access</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              id="nav-mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  id={`nav-item-mobile-${item.id}`}
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? `${palette.lightBg} ${palette.primaryText}` 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="border-t border-slate-100 pt-3 mt-3">
              {isAdmin ? (
                <div className="space-y-1 px-2">
                  <button
                    id="nav-admin-dashboard-mobile"
                    onClick={() => handleTabChange('admin')}
                    className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 ${
                      currentTab === 'admin' ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-5 h-5 text-slate-600" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    id="nav-logout-mobile"
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="px-2">
                  <button
                    id="nav-login-trigger-mobile"
                    onClick={() => {
                      onOpenLogin();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Editor Access</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
