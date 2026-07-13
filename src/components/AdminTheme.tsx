import React, { useState } from 'react';
import { Settings, Save, Layout, Check, Palette, Type, AlertCircle } from 'lucide-react';
import { ThemeSettings } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';

interface AdminThemeProps {
  settings: ThemeSettings;
  onSave: (settings: ThemeSettings) => Promise<void>;
}

export default function AdminTheme({ settings, onSave }: AdminThemeProps) {
  const [siteName, setSiteName] = useState(settings.siteName);
  const [siteDescription, setSiteDescription] = useState(settings.siteDescription);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [fontFamily, setFontFamily] = useState(settings.fontFamily);
  const [heroLayout, setHeroLayout] = useState(settings.heroLayout);
  const [activeSections, setActiveSections] = useState(settings.activeSections);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const colors: { id: ThemeSettings['primaryColor']; label: string; bg: string }[] = [
    { id: 'emerald', label: 'Emerald Escape', bg: 'bg-emerald-500' },
    { id: 'sky', label: 'Ocean Wanderer', bg: 'bg-sky-500' },
    { id: 'orange', label: 'Sunset Nomad', bg: 'bg-orange-500' },
    { id: 'amber', label: 'Earthy Explorer', bg: 'bg-amber-500' },
    { id: 'zinc', label: 'Charcoal Nomad', bg: 'bg-zinc-800' }
  ];

  const fonts: { id: ThemeSettings['fontFamily']; label: string; desc: string }[] = [
    { id: 'editorial', label: 'Elegant Editorial', desc: 'Playfair Display + Inter' },
    { id: 'modern', label: 'Modern Tech', desc: 'Space Grotesk + Inter' },
    { id: 'minimal', label: 'Clean Minimalist', desc: 'Inter + Inter' }
  ];

  const layouts: { id: ThemeSettings['heroLayout']; label: string; desc: string }[] = [
    { id: 'carousel', label: 'Featured Carousel', desc: 'Auto-rotating slides with large banners' },
    { id: 'static', label: 'Static Splash Card', desc: 'Minimal banner with single clean focus' },
    { id: 'minimal', label: 'Minimalist Clean', desc: 'Centered pure-text introduction' }
  ];

  const handleToggleSection = (key: keyof ThemeSettings['activeSections']) => {
    setActiveSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onSave({
        siteName,
        siteDescription,
        primaryColor,
        fontFamily,
        heroLayout,
        activeSections
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const activePalette = COLOR_PALETTES[primaryColor] || COLOR_PALETTES.emerald;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8">
      <form onSubmit={handleSave} className="space-y-8 font-sans">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-slate-500" />
              <span>Theme Customizer &amp; CMS Config</span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalize Travel Bee branding, typography, color tones, layout, and block triggers instantly.
            </p>
          </div>

          <button
            id="theme-save-btn"
            type="submit"
            disabled={isSaving}
            className={`inline-flex items-center space-x-2 px-4.5 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer shadow transition-all ${
              isSaving ? 'opacity-70 cursor-not-allowed' : activePalette.primaryBg + ' ' + activePalette.primaryHover
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600 shrink-0" />
            <span>Branding and theme configuration saved and applied to public blog successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Column: Branding details */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 pb-2 border-b border-slate-50">
              <Layout className="w-4 h-4" />
              <span>Site Branding</span>
            </h3>

            {/* Site Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Site Name / Brand
              </label>
              <input
                id="theme-site-name"
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Site Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Short Bio / Description
              </label>
              <textarea
                id="theme-site-desc"
                rows={3}
                required
                value={siteDescription}
                onChange={(e) => setSiteDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Block sections toggle */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Homepage Content Blocks
              </label>
              <div className="space-y-2">
                {[
                  { id: 'hero', label: 'Hero Block (Banners)' },
                  { id: 'featured', label: 'Featured Article Section' },
                  { id: 'latest', label: 'Latest Publication Grid' },
                  { id: 'curated', label: 'Curated Destination Tags' },
                  { id: 'newsletter', label: 'Hive Newsletter Subscription' }
                ].map((sec) => (
                  <label key={sec.id} className="flex items-center space-x-2.5 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      id={`toggle-sec-${sec.id}`}
                      type="checkbox"
                      checked={activeSections[sec.id as keyof ThemeSettings['activeSections']]}
                      onChange={() => handleToggleSection(sec.id as keyof ThemeSettings['activeSections'])}
                      className={`w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer`}
                    />
                    <span>{sec.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual styling choices */}
          <div className="space-y-6">
            
            {/* Palette picking */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 pb-2 border-b border-slate-50">
                <Palette className="w-4 h-4" />
                <span>Color Palette Tones</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {colors.map((col) => {
                  const isSelected = primaryColor === col.id;
                  return (
                    <button
                      id={`select-color-${col.id}`}
                      key={col.id}
                      type="button"
                      onClick={() => setPrimaryColor(col.id)}
                      className={`flex items-center space-x-2 p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-slate-800 bg-slate-50 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-4.5 h-4.5 rounded-full shrink-0 ${col.bg} flex items-center justify-center`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Typography pairings */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 pb-2 border-b border-slate-50">
                <Type className="w-4 h-4" />
                <span>Typography Pairings</span>
              </h3>
              <div className="flex flex-col gap-2">
                {fonts.map((f) => {
                  const isSelected = fontFamily === f.id;
                  return (
                    <button
                      id={`select-font-${f.id}`}
                      key={f.id}
                      type="button"
                      onClick={() => setFontFamily(f.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-800 bg-slate-50 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{f.label}</p>
                        <p className="text-[10px] text-slate-400">{f.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-slate-800" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hero layout selector */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5 pb-2 border-b border-slate-50">
                <Layout className="w-4 h-4" />
                <span>Hero Layout Display</span>
              </h3>
              <div className="flex flex-col gap-2">
                {layouts.map((l) => {
                  const isSelected = heroLayout === l.id;
                  return (
                    <button
                      id={`select-layout-${l.id}`}
                      key={l.id}
                      type="button"
                      onClick={() => setHeroLayout(l.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-slate-800 bg-slate-50 shadow-sm'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">{l.label}</p>
                        <p className="text-[10px] text-slate-400">{l.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-slate-800" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
