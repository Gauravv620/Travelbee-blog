import React, { useState, useEffect } from 'react';
import { Image, Search, Plus, Trash, Check, X, Sliders, Crop, Info } from 'lucide-react';
import { MediaItem, ThemeSettings } from '../types';
import { COLOR_PALETTES } from '../utils/theme';
import { getMediaItems, addMediaItem, deleteMediaItem } from '../firebase/db';

interface AdminMediaProps {
  settings: ThemeSettings;
}

export default function AdminMedia({ settings }: AdminMediaProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add Media modal/states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isAdding, setIsAdding] = useState(false);

  // Simulated Crop Modal states
  const [selectedCropItem, setSelectedCropItem] = useState<MediaItem | null>(null);
  const [cropZoom, setCropZoom] = useState(1.0);
  const [cropBrightness, setCropBrightness] = useState(100);
  const [cropContrast, setCropContrast] = useState(100);
  const [cropAspectRatio, setCropAspectRatio] = useState<'16:9' | '4:3' | '1:1' | 'free'>('16:9');
  const [cropX, setCropX] = useState(10);
  const [cropY, setCropY] = useState(10);
  const [cropW, setCropW] = useState(80);
  const [cropH, setCropH] = useState(80);
  const [isCropping, setIsCropping] = useState(false);

  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const data = await getMediaItems();
    setMediaList(data);
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim() || !newName.trim()) return;

    setIsAdding(true);
    try {
      const added = await addMediaItem({
        url: newUrl.trim(),
        name: newName.trim(),
        altText: newAltText.trim() || newName.trim(),
        category: newCategory
      });
      setMediaList(prev => [added, ...prev]);
      // reset fields
      setNewUrl('');
      setNewName('');
      setNewAltText('');
      setNewCategory('General');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (confirm('Are you sure you want to delete this image from your Media Library? Any post referencing this URL will retain the URL but the item won’t list here.')) {
      await deleteMediaItem(id);
      setMediaList(prev => prev.filter(m => m.id !== id));
    }
  };

  // Trigger simulated crop modal
  const handleOpenCrop = (item: MediaItem) => {
    setSelectedCropItem(item);
    setCropZoom(1.0);
    setCropBrightness(100);
    setCropContrast(100);
    setCropAspectRatio('16:9');
    setCropX(15);
    setCropY(15);
    setCropW(70);
    setCropH(70);
  };

  // Save updated cropped values
  const handleSaveCrop = () => {
    setIsCropping(true);
    setTimeout(() => {
      // Simulate saving crop values. We alert, update state and close.
      // In a real database, crop settings could modify url params (e.g. cloudflare/imgproxy resizers)
      // or save crop settings in the media db record.
      alert(`Image "${selectedCropItem?.name}" cropped & adjusted successfully! Applied crop coordinates: x:${cropX} y:${cropY} w:${cropW} h:${cropH}. Settings stored.`);
      setIsCropping(false);
      setSelectedCropItem(null);
    }, 1200);
  };

  // Filtered media items
  const filteredMedia = mediaList.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.altText.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Image className="w-5 h-5 text-slate-500" />
            <span>Travel Media Library</span>
          </h2>
          <p className="text-xs text-slate-400">
            Browse, manage, edit alt texts, and crop visual assets for your articles and galleries.
          </p>
        </div>

        <button
          id="media-add-trigger"
          onClick={() => setShowAddModal(true)}
          className={`inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:scale-[1.01] transition-all cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Media URL</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
        <input
          id="media-search-input"
          type="text"
          placeholder="Search images, category, alt texts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm shadow-sm"
        />
      </div>

      {/* Grid of Media */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center space-y-3">
          <Image className="w-10 h-10 mx-auto text-slate-300" />
          <p className="text-sm text-slate-400 font-medium">No media found. Click "Add Media URL" to insert images!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMedia.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Image Preview */}
              <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.altText}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <span className="absolute bottom-2 left-2 text-[9px] font-bold bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded font-sans uppercase tracking-wider">
                  {item.category}
                </span>
              </div>

              {/* Detail list footer */}
              <div className="p-3 space-y-1 border-t border-slate-50">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</p>
                <p className="text-[10px] text-slate-400 line-clamp-1 italic font-sans">Alt: {item.altText}</p>
              </div>

              {/* Hover actions block */}
              <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center gap-2">
                <button
                  id={`media-crop-btn-${item.id}`}
                  onClick={() => handleOpenCrop(item)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-xs text-slate-800 font-bold shadow transition cursor-pointer"
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Crop &amp; Filter</span>
                </button>
                <button
                  id={`media-delete-btn-${item.id}`}
                  onClick={() => handleDeleteMedia(item.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs text-white font-bold shadow transition cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add New Image */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <button
              id="close-add-modal-btn"
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Add Image to Library</h3>
              <p className="text-xs text-slate-400">Specify an Unsplash or external WebP/JPG URL to register asset.</p>
            </div>

            <form onSubmit={handleAddMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Image URL
                </label>
                <input
                  id="media-add-url"
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Asset Title / Name
                </label>
                <input
                  id="media-add-name"
                  type="text"
                  required
                  placeholder="e.g. Kyoto dawn path"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Alt Text (for SEO accessibility)
                </label>
                <input
                  id="media-add-alt"
                  type="text"
                  placeholder="Describe what is in the image..."
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Category Tag
                </label>
                <input
                  id="media-add-category"
                  type="text"
                  placeholder="e.g. Asia, Europe, Gear, General"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                id="media-submit-btn"
                type="submit"
                disabled={isAdding}
                className={`w-full inline-flex items-center justify-center py-2.5 font-semibold text-white text-sm rounded-xl cursor-pointer ${
                  isAdding ? 'opacity-70 cursor-not-allowed' : palette.primaryBg + ' ' + palette.primaryHover
                }`}
              >
                <span>{isAdding ? 'Registering...' : 'Register Asset'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Crop Simulated Advanced Tool Modal */}
      {selectedCropItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-3xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl relative">
            <button
              id="close-crop-modal-btn"
              onClick={() => setSelectedCropItem(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title */}
            <div className="md:col-span-3 space-y-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-1.5">
                <Crop className="w-5 h-5 text-emerald-600" />
                <span>Simulated Smart Media Cropping Engine</span>
              </h3>
              <p className="text-xs text-slate-400">
                Adjust cropping frame, brightness, exposure levels, and zoom factor prior to saving.
              </p>
            </div>

            {/* Preview Left Area */}
            <div className="md:col-span-2 space-y-4 flex flex-col justify-center">
              <div className="relative aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                
                {/* Image under scale and filter filters */}
                <div 
                  className="transition-all duration-150 relative w-full h-full"
                  style={{
                    transform: `scale(${cropZoom})`,
                    filter: `brightness(${cropBrightness}%) contrast(${cropContrast}%)`,
                  }}
                >
                  <img
                    src={selectedCropItem.url}
                    alt={selectedCropItem.altText}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Simulated Crop Grid Overlays */}
                <div 
                  className="absolute border-2 border-dashed border-emerald-500 bg-emerald-500/10 pointer-events-none rounded transition-all duration-150"
                  style={{
                    left: `${cropX}%`,
                    top: `${cropY}%`,
                    width: `${cropW}%`,
                    height: `${cropH}%`,
                  }}
                >
                  {/* Grid Lines inside crop area */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-60">
                    <div className="border-r border-dashed border-white"></div>
                    <div className="border-r border-dashed border-white"></div>
                    <div></div>
                    <div className="border-b border-dashed border-white col-span-3"></div>
                    <div className="border-b border-dashed border-white col-span-3"></div>
                  </div>
                  {/* Crop Aspect badge inside */}
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 font-bold rounded">
                    {cropAspectRatio.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-400 text-xs">
                <Info className="w-4 h-4 shrink-0 text-amber-500" />
                <span>Drag the sliders below to crop coordinates, set borders, and optimize contrast.</span>
              </div>
            </div>

            {/* Adjustments Form Right panel */}
            <div className="md:col-span-1 space-y-5 border-l border-slate-100 pl-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Adjust Filters</span>
                </h4>

                {/* Aspect selector */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['16:9', '4:3', '1:1', 'free'].map(r => (
                      <button
                        id={`crop-aspect-${r}`}
                        key={r}
                        type="button"
                        onClick={() => {
                          setCropAspectRatio(r as any);
                          if (r === '1:1') { setCropW(60); setCropH(60); }
                          else if (r === '4:3') { setCropW(70); setCropH(52.5); }
                          else { setCropW(80); setCropH(45); }
                        }}
                        className={`px-2 py-1 text-xs rounded border cursor-pointer font-semibold ${
                          cropAspectRatio === r ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Scale Zoom</span>
                    <span className="text-slate-800">{cropZoom.toFixed(1)}x</span>
                  </div>
                  <input
                    id="crop-zoom-slider"
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.1"
                    value={cropZoom}
                    onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Crop Box X-Offset */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Horizontal Crop Offset</span>
                    <span className="text-slate-800">{cropX}%</span>
                  </div>
                  <input
                    id="crop-x-slider"
                    type="range"
                    min="0"
                    max="50"
                    value={cropX}
                    onChange={(e) => setCropX(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Brightness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Exposure Contrast</span>
                    <span className="text-slate-800">{cropBrightness}%</span>
                  </div>
                  <input
                    id="crop-brightness-slider"
                    type="range"
                    min="50"
                    max="150"
                    value={cropBrightness}
                    onChange={(e) => setCropBrightness(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                <button
                  id="crop-apply-btn"
                  onClick={handleSaveCrop}
                  disabled={isCropping}
                  className={`w-full py-2.5 text-xs font-bold text-white rounded-xl shadow cursor-pointer flex items-center justify-center space-x-1.5 ${palette.primaryBg} ${palette.primaryHover}`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isCropping ? 'Cropping...' : 'Apply Crop &amp; Filter'}</span>
                </button>
                <button
                  id="crop-cancel-btn"
                  onClick={() => setSelectedCropItem(null)}
                  className="w-full py-2 text-xs font-semibold text-slate-500 border border-slate-200 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
