import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Plus, Search, Edit, Eye, Trash, Copy, Save, Calendar, 
  History, EyeOff, Star, Heading, Bold, Italic, Quote, Image, Sparkles, Check, X, Undo 
} from 'lucide-react';
import { Post, Author, ThemeSettings, MediaItem, Revision } from '../types';
import { COLOR_PALETTES } from '../utils/theme';
import { getPosts, savePost, deletePost, getMediaItems, getRevisions } from '../firebase/db';
import { renderMarkdown } from '../utils/markdown';

interface AdminPostsProps {
  settings: ThemeSettings;
  authors: Author[];
  editorEmail: string;
}

export default function AdminPosts({ settings, authors, editorEmail }: AdminPostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // View states: 'list' | 'create' | 'edit'
  const [viewState, setViewState] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<Post['status']>('draft');
  const [publishedAt, setPublishedAt] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [readingTime, setReadingTime] = useState(5);

  // Editor Sub-tabs: 'write' | 'preview'
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Media Library Selection Popups
  const [showMediaSelector, setShowMediaSelector] = useState<'hero' | 'gallery' | 'inline' | null>(null);

  // Revision History State
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [showRevisions, setShowRevisions] = useState(false);

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const contentRef = useRef<HTMLTextAreaElement>(null);
  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;

  useEffect(() => {
    loadPosts();
    loadMedia();
  }, []);

  const loadPosts = async () => {
    const data = await getPosts(true); // Include drafts/scheduled
    setPosts(data);
  };

  const loadMedia = async () => {
    const data = await getMediaItems();
    setMediaList(data);
  };

  // Helper: Convert title to slug
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // remove invalid characters
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (viewState === 'create') {
      setSlug(slugify(val));
    }
  };

  const handleCreateNewTrigger = () => {
    // Reset Form
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('');
    setStatus('draft');
    setPublishedAt('');
    setScheduledFor('');
    setAuthorId(authors[0]?.id || '');
    setHeroImage(mediaList[0]?.url || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80');
    setGallery([]);
    setCategory('General');
    setTagsInput('');
    setIsFeatured(false);
    setReadingTime(5);
    setEditorTab('write');
    setRevisions([]);
    setShowRevisions(false);
    setViewState('create');
  };

  const handleEditTrigger = async (post: Post) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setStatus(post.status);
    setPublishedAt(post.publishedAt || '');
    setScheduledFor(post.scheduledFor || '');
    setAuthorId(post.authorId);
    setHeroImage(post.heroImage);
    setGallery(post.gallery || []);
    setCategory(post.category);
    setTagsInput(post.tags.join(', '));
    setIsFeatured(post.isFeatured);
    setReadingTime(post.readingTime || 5);
    setEditorTab('write');
    setShowRevisions(false);

    // Fetch Version History (Revisions)
    const revs = await getRevisions(post.id);
    setRevisions(revs);
    
    setViewState('edit');
  };

  // Duplicate Post Action
  const handleDuplicatePost = async (post: Post) => {
    const duplicatedSlug = `${post.slug}-copy-${Math.floor(100 + Math.random() * 900)}`;
    const duplicatedPost: Post = {
      ...post,
      id: duplicatedSlug,
      slug: duplicatedSlug,
      title: `${post.title} (Copy)`,
      status: 'draft',
      publishedAt: new Date().toISOString(),
      scheduledFor: null,
      viewCount: 0
    };

    if (confirm(`Duplicate post "${post.title}"?`)) {
      await savePost(duplicatedPost, editorEmail);
      await loadPosts();
    }
  };

  // Delete Post Action
  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to permanently delete this article? This action cannot be undone.')) {
      await deletePost(postId);
      await loadPosts();
    }
  };

  // Submit / Save Post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !content.trim()) return;

    setIsSaving(true);
    setSaveMessage('');

    const processedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const postToSave: Post = {
      id: viewState === 'edit' && editingPost ? editingPost.id : slug,
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || title.trim(),
      content: content.trim(),
      status: status,
      publishedAt: status === 'published' ? (publishedAt || new Date().toISOString()) : '',
      scheduledFor: status === 'scheduled' ? (scheduledFor || new Date(Date.now() + 24*3600*1000).toISOString()) : null,
      authorId: authorId || authors[0]?.id || 'system',
      heroImage: heroImage,
      gallery: gallery,
      category: category.trim() || 'General',
      tags: processedTags,
      isFeatured: isFeatured,
      viewCount: viewState === 'edit' && editingPost ? editingPost.viewCount : 0,
      readingTime: Number(readingTime) || 5
    };

    try {
      await savePost(postToSave, editorEmail);
      setSaveMessage('Article saved successfully!');
      await loadPosts();
      setTimeout(() => {
        setViewState('list');
        setEditingPost(null);
      }, 1000);
    } catch (err) {
      console.error(err);
      setSaveMessage('Error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Rollback to specific revision
  const handleRollback = (rev: Revision) => {
    if (confirm(`Are you sure you want to restore the editor content to this version saved on ${new Date(rev.updatedAt).toLocaleString()}?`)) {
      setTitle(rev.title);
      setContent(rev.content);
      setExcerpt(rev.excerpt);
      setEditorTab('write');
      setShowRevisions(false);
      alert('Editor content rolled back to this version! Please hit "Save Settings" / "Register Asset" (or post Save) to commit the rollback permanently.');
    }
  };

  // Insert Markdown Tags Helper
  const insertMarkdown = (syntaxBefore: string, syntaxAfter = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = syntaxBefore + (selected || 'text') + syntaxAfter;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    
    setContent(newContent);
    
    // reset cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + syntaxBefore.length, start + syntaxBefore.length + (selected || 'text').length);
    }, 50);
  };

  // Handle selected image from Media selector
  const handleSelectMediaItem = (itemUrl: string) => {
    if (showMediaSelector === 'hero') {
      setHeroImage(itemUrl);
    } else if (showMediaSelector === 'gallery') {
      setGallery(prev => prev.includes(itemUrl) ? prev.filter(u => u !== itemUrl) : [...prev, itemUrl]);
    } else if (showMediaSelector === 'inline') {
      insertMarkdown(`![Image Description](${itemUrl})`);
    }
    setShowMediaSelector(null);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-sans">

      {/* Main post listing view */}
      {viewState === 'list' && (
        <div className="space-y-6">
          {/* Header Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-slate-500" />
                <span>Travel Articles Manager</span>
              </h2>
              <p className="text-xs text-slate-400">
                Write journals, manage statuses, schedule future trips, and audit statistics.
              </p>
            </div>

            <button
              id="create-new-post-btn"
              onClick={handleCreateNewTrigger}
              className={`inline-flex items-center space-x-1.5 px-4.5 py-2.5 rounded-xl text-sm font-semibold text-white shadow hover:scale-[1.01] transition-all cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
            >
              <Plus className="w-4 h-4" />
              <span>Write New Story</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            <input
              id="posts-search-input"
              type="text"
              placeholder="Search by title, tags, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm shadow-sm"
            />
          </div>

          {/* Posts list panel */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-slate-400 text-sm font-medium">No articles found. Write your first story above!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider font-semibold font-sans">
                      <th className="py-4 px-6">Article Details</th>
                      <th className="py-4 px-6">Destination</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Stats</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={post.heroImage}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-100"
                            />
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900 line-clamp-1">{post.title}</p>
                              <p className="text-[11px] text-slate-400 flex items-center space-x-2">
                                {post.isFeatured && (
                                  <span className="flex items-center space-x-0.5 text-amber-500 font-bold uppercase tracking-wide">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>Featured</span>
                                  </span>
                                )}
                                <span>Slug: {post.slug}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                            {post.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {post.status === 'published' ? (
                            <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                              Published
                            </span>
                          ) : post.status === 'scheduled' ? (
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                              Scheduled
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-500 text-xs space-y-0.5">
                          <p>{post.viewCount || 0} views</p>
                          <p>{post.readingTime}m read</p>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              id={`post-list-edit-${post.id}`}
                              onClick={() => handleEditTrigger(post)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              title="Edit Article"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              id={`post-list-duplicate-${post.id}`}
                              onClick={() => handleDuplicatePost(post)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                              title="Duplicate Article"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              id={`post-list-delete-${post.id}`}
                              onClick={() => handleDeletePost(post.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Article"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Editor Panel View */}
      {(viewState === 'create' || viewState === 'edit') && (
        <form onSubmit={handleSavePost} className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6">
          
          {/* Editor Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-center space-x-3">
              <button
                id="editor-back-to-list"
                type="button"
                onClick={() => setViewState('list')}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {viewState === 'create' ? 'Write Travel Log' : `Edit: "${title}"`}
                </h3>
                <p className="text-xs text-slate-400">
                  Compose high-quality travel journals, style using rich Markdown, and manage scheduling.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Revision history button (edit only) */}
              {viewState === 'edit' && (
                <button
                  id="editor-revisions-toggle"
                  type="button"
                  onClick={() => setShowRevisions(!showRevisions)}
                  className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold border cursor-pointer transition ${
                    showRevisions 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Version History ({revisions.length})</span>
                </button>
              )}

              {/* Submit Buttons */}
              <button
                id="editor-submit-btn"
                type="submit"
                disabled={isSaving}
                className={`inline-flex items-center space-x-1 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition cursor-pointer ${palette.primaryBg} ${palette.primaryHover}`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>

          {saveMessage && (
            <div className="p-3 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-700 flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>{saveMessage}</span>
            </div>
          )}

          {/* Grid panel: Form inputs and Sidebar details */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Version rollbacks sidebar panel if active */}
            {showRevisions && (
              <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-1.5">
                    <History className="w-4 h-4 text-emerald-600" />
                    <span>Revision History (Rollback Engine)</span>
                  </h4>
                  <button 
                    type="button" 
                    onClick={() => setShowRevisions(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Hide
                  </button>
                </div>
                {revisions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No revisions saved for this article yet. Revisions auto-save each time you modify and update the article.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {revisions.map((rev) => (
                      <div key={rev.id} className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col justify-between space-y-3 shadow-sm">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 truncate">Title: "{rev.title}"</p>
                          <p className="text-[10px] text-slate-400">Saved: {new Date(rev.updatedAt).toLocaleString()}</p>
                          <p className="text-[10px] text-slate-400">Editor: {rev.updatedBy}</p>
                        </div>
                        <button
                          id={`rollback-rev-${rev.id}`}
                          type="button"
                          onClick={() => handleRollback(rev)}
                          className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-100 flex items-center justify-center space-x-1"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          <span>Rollback Editor Here</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Main Form Fields Column */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Article Title
                </label>
                <input
                  id="editor-title-input"
                  type="text"
                  required
                  placeholder="e.g. Kyoto's Secret Bamboo Paths"
                  value={title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 font-bold text-slate-900"
                />
              </div>

              {/* Editable Slug URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>URL Slug Path</span>
                  <span className="text-[10px] text-slate-400 font-normal normal-case">Automatically matching title but fully editable</span>
                </label>
                <div className="flex rounded-xl bg-slate-50 border border-slate-200 overflow-hidden text-sm">
                  <span className="bg-slate-100 text-slate-400 px-3 py-2 border-r border-slate-200 select-none text-xs flex items-center">
                    /blog/
                  </span>
                  <input
                    id="editor-slug-input"
                    type="text"
                    required
                    placeholder="kyotos-secret-bamboo-paths"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border-none focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Brief Excerpt / Summary (SEO-friendly)
                </label>
                <input
                  id="editor-excerpt-input"
                  type="text"
                  placeholder="Give a brief hook description for archives and search displays..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* WYSIWYG Content Area */}
              <div className="space-y-2 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                
                {/* Editor Tabs Toolbar */}
                <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex space-x-1.5 bg-slate-200/50 p-1 rounded-xl">
                    <button
                      id="editor-tab-write"
                      type="button"
                      onClick={() => setEditorTab('write')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        editorTab === 'write' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      id="editor-tab-preview"
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        editorTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Preview (Live HTML)
                    </button>
                  </div>

                  {/* Markdown Helpers */}
                  {editorTab === 'write' && (
                    <div className="flex items-center space-x-1">
                      <button
                        id="editor-insert-h"
                        type="button"
                        onClick={() => insertMarkdown('## ', '\n')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition"
                        title="Add Heading"
                      >
                        <Heading className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id="editor-insert-b"
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition"
                        title="Add Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id="editor-insert-i"
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition"
                        title="Add Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id="editor-insert-q"
                        type="button"
                        onClick={() => insertMarkdown('> ', '\n')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition"
                        title="Add Quote"
                      >
                        <Quote className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id="editor-insert-img"
                        type="button"
                        onClick={() => setShowMediaSelector('inline')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md border border-transparent hover:border-slate-200 transition flex items-center space-x-0.5"
                        title="Insert Image from Library"
                      >
                        <Image className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold">Media</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Content Input Panels */}
                {editorTab === 'write' ? (
                  <textarea
                    id="editor-content-textarea"
                    ref={contentRef}
                    required
                    placeholder="# Begin your journey... Write stories in Markdown syntax."
                    rows={18}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-white border-none focus:outline-none font-mono leading-relaxed"
                  />
                ) : (
                  <div className="bg-white min-h-[360px] p-6 overflow-y-auto">
                    <div 
                      className="prose prose-slate max-w-none text-slate-800"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Column details */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Publication details panel */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2">
                  Publishing Settings
                </h4>

                {/* Status selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status</label>
                  <select
                    id="editor-status-select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer"
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="published">Publish Now</option>
                    <option value="scheduled">Schedule Publication</option>
                  </select>
                </div>

                {/* Schedule date (only visible if status is scheduled) */}
                {status === 'scheduled' && (
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Scheduled Date</label>
                    <input
                      id="editor-scheduled-date"
                      type="datetime-local"
                      required
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                )}

                {/* Author selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Author</label>
                  <select
                    id="editor-author-select"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 cursor-pointer"
                  >
                    {authors.map(auth => (
                      <option key={auth.id} value={auth.id}>{auth.name} ({auth.role})</option>
                    ))}
                  </select>
                </div>

                {/* Category selector */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Category</label>
                  <input
                    id="editor-category-input"
                    type="text"
                    required
                    placeholder="e.g. Asia, Europe"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>

                {/* Tags input */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tags (comma-separated)</label>
                  <input
                    id="editor-tags-input"
                    type="text"
                    placeholder="Japan, Kyoto, Solo Travel"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>

                {/* Reading time */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reading Time (mins)</label>
                  <input
                    id="editor-reading-time"
                    type="number"
                    min={1}
                    value={readingTime}
                    onChange={(e) => setReadingTime(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>

                {/* Featured Checkbox */}
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
                  <input
                    id="editor-featured-checkbox"
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span>Feature on Homepage Hero</span>
                </label>
              </div>

              {/* Hero Image Selection Block */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center justify-between">
                  <span>Hero Image</span>
                  <button
                    id="select-hero-img-trigger"
                    type="button"
                    onClick={() => setShowMediaSelector('hero')}
                    className="text-[10px] text-emerald-600 font-bold hover:underline"
                  >
                    Select
                  </button>
                </h4>
                {heroImage ? (
                  <div className="relative aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={heroImage}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      id="remove-hero-image"
                      type="button"
                      onClick={() => setHeroImage('')}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/65 hover:bg-black/80 rounded-full text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    id="hero-img-placeholder"
                    type="button"
                    onClick={() => setShowMediaSelector('hero')}
                    className="w-full aspect-[16/10] rounded-lg border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50 transition flex flex-col items-center justify-center text-slate-400"
                  >
                    <Image className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-semibold">Select Cover</span>
                  </button>
                )}
              </div>

              {/* Storyboard gallery panel */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b pb-2 flex items-center justify-between">
                  <span>Storyboard Gallery</span>
                  <button
                    id="select-gallery-trigger"
                    type="button"
                    onClick={() => setShowMediaSelector('gallery')}
                    className="text-[10px] text-emerald-600 font-bold hover:underline"
                  >
                    Manage
                  </button>
                </h4>
                {gallery.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No gallery selected yet. Tap manage to add images.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {gallery.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          id={`remove-gallery-img-${i}`}
                          type="button"
                          onClick={() => setGallery(prev => prev.filter(u => u !== img))}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        </form>
      )}

      {/* Media Selector Dialog Overlay popup */}
      {showMediaSelector !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 max-w-xl w-full max-h-[80vh] flex flex-col space-y-4 shadow-2xl relative">
            <button
              id="close-media-selector-btn"
              type="button"
              onClick={() => setShowMediaSelector(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {showMediaSelector === 'hero' ? 'Select Cover Image' : showMediaSelector === 'gallery' ? 'Manage Gallery Slideshow' : 'Insert Image Inline'}
              </h3>
              <p className="text-xs text-slate-400">Choose images already registered in your Media Library.</p>
            </div>

            {/* Grid of media in selector */}
            <div className="overflow-y-auto flex-grow pr-1.5">
              {mediaList.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">Your media library is empty. Close this and add images in the "Media" tab first.</p>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {mediaList.map((item) => {
                    const isSelected = showMediaSelector === 'gallery' && gallery.includes(item.url);
                    return (
                      <button
                        id={`selector-item-${item.id}`}
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectMediaItem(item.url)}
                        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 text-left cursor-pointer transition ${
                          isSelected ? 'border-emerald-600' : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 hover:bg-black/10 transition" />
                        
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-emerald-600 text-white rounded-full p-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1.5 text-[8px] bg-black/60 text-white px-1.5 py-0.5 rounded uppercase font-bold truncate max-w-[80%]">
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
