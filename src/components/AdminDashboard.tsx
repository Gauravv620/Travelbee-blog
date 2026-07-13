import React, { useState, useEffect } from 'react';
import { Settings, FileText, Image, Users, LogOut, Compass, Plus, Save, Edit, Trash, Check, User } from 'lucide-react';
import { Author, ThemeSettings } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';
import { getAuthors, saveAuthor } from '../firebase/db';
import AdminPosts from './AdminPosts';
import AdminMedia from './AdminMedia';
import AdminTheme from './AdminTheme';

interface AdminDashboardProps {
  settings: ThemeSettings;
  onSaveThemeSettings: (settings: ThemeSettings) => Promise<void>;
  editorEmail: string;
  onLogout: () => void;
  onExitAdmin?: () => void;
}

export default function AdminDashboard({
  settings,
  onSaveThemeSettings,
  editorEmail,
  onLogout,
  onExitAdmin
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'theme' | 'authors'>('posts');
  const [authors, setAuthors] = useState<Author[]>([]);
  
  // Author management state
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [authName, setAuthName] = useState('');
  const [authAvatar, setAuthAvatar] = useState('');
  const [authBio, setAuthBio] = useState('');
  const [authRole, setAuthRole] = useState<'Admin' | 'Editor' | 'Author'>('Author');
  const [authTwitter, setAuthTwitter] = useState('');
  const [authInstagram, setAuthInstagram] = useState('');
  const [authWebsite, setAuthWebsite] = useState('');
  const [isSavingAuthor, setIsSavingAuthor] = useState(false);

  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    const data = await getAuthors();
    setAuthors(data);
  };

  const handleEditAuthor = (author: Author) => {
    setEditingAuthor(author);
    setAuthName(author.name);
    setAuthAvatar(author.avatar);
    setAuthBio(author.bio);
    setAuthRole(author.role || 'Author');
    setAuthTwitter(author.socials.twitter || '');
    setAuthInstagram(author.socials.instagram || '');
    setAuthWebsite(author.socials.website || '');
  };

  const handleCreateAuthorTrigger = () => {
    setEditingAuthor({
      id: `author-${Math.floor(Math.random() * 1000)}`,
      name: '',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
      bio: '',
      role: 'Author',
      socials: {}
    });
    setAuthName('');
    setAuthAvatar('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80');
    setAuthBio('');
    setAuthRole('Author');
    setAuthTwitter('');
    setAuthInstagram('');
    setAuthWebsite('');
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authBio.trim() || !editingAuthor) return;

    setIsSavingAuthor(true);
    const authorToSave: Author = {
      id: editingAuthor.id,
      name: authName.trim(),
      avatar: authAvatar.trim(),
      bio: authBio.trim(),
      role: authRole,
      socials: {
        ...(authTwitter.trim() && { twitter: authTwitter.trim() }),
        ...(authInstagram.trim() && { instagram: authInstagram.trim() }),
        ...(authWebsite.trim() && { website: authWebsite.trim() })
      }
    };

    try {
      await saveAuthor(authorToSave);
      setEditingAuthor(null);
      await loadAuthors();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingAuthor(false);
    }
  };

  const menuItems = [
    { id: 'posts', label: 'Articles', icon: FileText },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'theme', label: 'Theme Config', icon: Settings },
    { id: 'authors', label: 'Authors & Bio', icon: Users }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sleek Admin Sidebar (CMS Interface) */}
      <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className={`w-8 h-8 ${palette.primaryBg} rounded-xl flex items-center justify-center shadow-sm`}>
            <Compass className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">
            TravelBee <span className="text-slate-400 font-medium">CMS</span>
          </span>
        </div>
        
        <nav className="flex-grow p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">Site Management</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`admin-tab-trigger-${item.id}`}
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setEditingAuthor(null);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? `${palette.lightBg} ${palette.primaryText} border border-amber-100/50 shadow-sm`
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mt-8 mb-2">Quick Navigation</div>
          <button
            onClick={onExitAdmin}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer text-sm font-semibold"
          >
            <Compass className="w-5 h-5 text-slate-400" />
            <span>View Live Site</span>
          </button>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
            <div className={`w-8 h-8 rounded-full ${palette.lightBg} ${palette.primaryText} flex items-center justify-center font-extrabold text-xs shrink-0 border border-slate-200`}>
              {editorEmail ? editorEmail.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="overflow-hidden flex-grow">
              <p className="text-xs font-bold truncate text-slate-800">{editorEmail || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500">Active Session</p>
            </div>
            <button
              onClick={onLogout}
              title="Exit Admin Mode"
              className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Live Preview Area / Workspace */}
      <main className="flex-grow flex flex-col p-6 md:p-8 overflow-y-auto">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">CMS Central Workspace</h1>
            <p className="text-sm text-slate-500 font-sans">
              Editing Block: <span className={`${palette.primaryText} font-semibold capitalize`}>{activeTab}</span>
            </p>
          </div>
          
          <button
            id="admin-dashboard-exit-btn"
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Exit CMS Panel</span>
          </button>
        </header>

        {/* Workspace Panel Content */}
        <div className="flex-grow max-w-6xl w-full">
          {activeTab === 'posts' && (
            <AdminPosts
              settings={settings}
              authors={authors}
              editorEmail={editorEmail}
            />
          )}

          {activeTab === 'media' && (
            <AdminMedia settings={settings} />
          )}

          {activeTab === 'theme' && (
            <AdminTheme
              settings={settings}
              onSave={onSaveThemeSettings}
            />
          )}

          {activeTab === 'authors' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                
                {/* Author Sub-view List */}
                {!editingAuthor ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                          <Users className="w-5 h-5 text-slate-500" />
                          <span>Authors &amp; Content Team</span>
                        </h2>
                        <p className="text-xs text-slate-400">Manage editorial accounts, bios, and portraits.</p>
                      </div>

                      <button
                        id="add-author-trigger"
                        onClick={handleCreateAuthorTrigger}
                        className={`inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Writer</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {authors.map((auth) => (
                        <div key={auth.id} className="p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50">
                          <div className="flex items-center space-x-3">
                            <img
                              src={auth.avatar}
                              alt={auth.name}
                              className="w-11 h-11 rounded-xl object-cover shrink-0 border"
                            />
                            <div>
                              <p className="font-bold text-slate-800 text-sm leading-tight">{auth.name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold uppercase">{auth.role}</p>
                            </div>
                          </div>

                          <button
                            id={`edit-author-btn-${auth.id}`}
                            onClick={() => handleEditAuthor(auth)}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                            title="Edit Account Details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Author edit/create form
                  <form onSubmit={handleSaveAuthor} className="space-y-5 font-sans">
                    <div className="flex items-center justify-between border-b pb-4">
                      <h3 className="font-bold text-slate-800 text-lg">
                        {authName ? `Edit: ${authName}` : 'Add New Content Writer'}
                      </h3>
                      <button
                        id="cancel-author-edit"
                        type="button"
                        onClick={() => setEditingAuthor(null)}
                        className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Writer Name *
                          </label>
                          <input
                            id="author-form-name"
                            type="text"
                            required
                            placeholder="e.g. Sandra Bullock"
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Avatar Portrait URL
                          </label>
                          <input
                            id="author-form-avatar"
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={authAvatar}
                            onChange={(e) => setAuthAvatar(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Editorial Role
                          </label>
                          <select
                            id="author-form-role"
                            value={authRole}
                            onChange={(e) => setAuthRole(e.target.value as any)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                          >
                            <option value="Author">Author (Writes posts)</option>
                            <option value="Editor">Editor (Edits and publishes)</option>
                            <option value="Admin">Administrator (Full site control)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Twitter Handler
                          </label>
                          <input
                            id="author-form-twitter"
                            type="text"
                            placeholder="e.g. sandratravels"
                            value={authTwitter}
                            onChange={(e) => setAuthTwitter(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Instagram Handler
                          </label>
                          <input
                            id="author-form-instagram"
                            type="text"
                            placeholder="e.g. sandrawanders"
                            value={authInstagram}
                            onChange={(e) => setAuthInstagram(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Website Link
                          </label>
                          <input
                            id="author-form-website"
                            type="text"
                            placeholder="e.g. sandrabullock.com"
                            value={authWebsite}
                            onChange={(e) => setAuthWebsite(e.target.value)}
                            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Author Bio *
                        </label>
                        <textarea
                          id="author-form-bio"
                          required
                          rows={3}
                          placeholder="Tell us about this author..."
                          value={authBio}
                          onChange={(e) => setAuthBio(e.target.value)}
                          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      id="author-form-save-btn"
                      type="submit"
                      disabled={isSavingAuthor}
                      className={`w-full py-2.5 font-semibold text-white text-sm rounded-xl cursor-pointer ${
                        isSavingAuthor ? 'opacity-70 cursor-not-allowed' : palette.primaryBg + ' ' + palette.primaryHover
                      }`}
                    >
                      <span>{isSavingAuthor ? 'Saving Account...' : 'Register/Update Author Account'}</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
  );
}
