import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Eye, Send, Trash, Share2, Twitter, Globe, Instagram, Check } from 'lucide-react';
import { Post, Author, ThemeSettings, Comment } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';
import { renderMarkdown } from '../utils/markdown';
import { getComments, addComment, deleteComment } from '../firebase/db';

interface PostDetailProps {
  settings: ThemeSettings;
  post: Post;
  authors: Author[];
  isAdmin: boolean;
  onBack: () => void;
  onSelectAuthor: (authorId: string) => void;
}

export default function PostDetail({
  settings,
  post,
  authors,
  isAdmin,
  onBack,
  onSelectAuthor
}: PostDetailProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  const author = authors.find(a => a.id === post.authorId);
  const authorName = author ? author.name : 'Travel Bee Writer';
  const authorAvatar = author ? author.avatar : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80';

  useEffect(() => {
    loadComments();
    // Scroll to top when view opens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [post.id]);

  const loadComments = async () => {
    const data = await getComments(post.id);
    setComments(data);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const newComm = await addComment({
        postId: post.id,
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: content.trim()
      });
      setComments(prev => [...prev, newComm]);
      setName('');
      setEmail('');
      setContent('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(id);
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleShareTwitter = () => {
    const text = `Read "${post.title}" by ${authorName} on Travel Bee!`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Generate Schema Markup (Structured Data) for SEO Friendly Article
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.heroImage,
    "datePublished": post.publishedAt,
    "author": {
      "@type": "Person",
      "name": authorName,
      "image": authorAvatar
    },
    "publisher": {
      "@type": "Organization",
      "name": settings.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=80&h=80&q=80"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Inject Structured Data Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      {/* Back & Share Sticky Header */}
      <div className="border-b border-slate-100 bg-white/95 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            id="post-detail-back-btn"
            onClick={onBack}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </button>

          <div className="flex items-center space-x-3">
            {/* Share action */}
            <button
              id="post-share-twitter"
              onClick={handleShareTwitter}
              className="p-1.5 text-slate-400 hover:text-sky-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              title="Share on Twitter"
            >
              <Twitter className="w-4 h-4" />
            </button>
            <button
              id="post-share-copy"
              onClick={handleCopyLink}
              className="flex items-center space-x-1 p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg hover:bg-slate-50 transition-colors text-xs font-medium cursor-pointer"
              title="Copy link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              {copiedLink && <span>Copied!</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Large Hero Banner */}
      <div className="relative aspect-[21/9] w-full bg-slate-900 overflow-hidden">
        <img
          src={post.heroImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8">
          <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full text-white ${palette.primaryBg}`}>
            {post.category}
          </span>
        </div>
      </div>

      {/* Post content container */}
      <article className="max-w-4xl mx-auto px-4 pt-8 md:pt-12">
        {/* Title */}
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 mb-6 tracking-tight leading-tight ${fonts.titleFont}`}>
          {post.title}
        </h1>

        {/* Metadata section */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-6 border-b border-slate-100 text-slate-500 text-sm font-sans">
          {/* Author info */}
          <div 
            onClick={() => onSelectAuthor(post.authorId)}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-slate-100 group-hover:ring-2 group-hover:ring-emerald-500 transition-all"
            />
            <div>
              <p className="font-medium text-slate-800 text-xs sm:text-sm group-hover:text-slate-900 leading-none mb-1">{authorName}</p>
              <p className="text-[11px] text-slate-400 font-normal leading-none">{author?.role || 'Writer'}</p>
            </div>
          </div>

          <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-200" />

          {/* Date */}
          <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-slate-200" />

          {/* Read time */}
          <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
            <Clock className="w-4 h-4" />
            <span>{post.readingTime} min read</span>
          </div>

          {post.viewCount > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-200" />
              <div className="flex items-center space-x-1.5 text-xs sm:text-sm">
                <Eye className="w-4 h-4" />
                <span>{post.viewCount} views</span>
              </div>
            </>
          )}
        </div>

        {/* Rich article content container */}
        <div className="py-8">
          <div 
            className="prose prose-slate max-w-none text-slate-800"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />
        </div>

        {/* Gallery display (if present) */}
        {post.gallery && post.gallery.length > 0 && (
          <div className="my-10 border-t border-slate-100 pt-8">
            <h3 className={`text-xl font-bold text-slate-900 mb-4 ${fonts.titleFont}`}>
              Visual Storyboard
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {post.gallery.map((imgUrl, i) => (
                <div key={i} className="overflow-hidden rounded-xl aspect-[4/3] bg-slate-50 group shadow-sm">
                  <img
                    src={imgUrl}
                    alt={`${post.title} gallery ${i + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags footer */}
        <div className="flex flex-wrap gap-2 py-6 border-b border-slate-100">
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg font-sans transition-colors cursor-pointer ${palette.badgeBg} ${palette.badgeText}`}
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Author Bio section */}
        {author && (
          <div className="my-12 p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
            <img
              src={author.avatar}
              alt={author.name}
              className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-4 ring-white"
            />
            <div className="space-y-2.5 flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className={`text-lg font-bold text-slate-900 ${fonts.titleFont}`}>
                  Written by {author.name}
                </h4>
                {/* Social icons */}
                <div className="flex items-center justify-center space-x-2">
                  {author.socials.twitter && (
                    <a href={`https://twitter.com/${author.socials.twitter}`} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-sky-500">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {author.socials.instagram && (
                    <a href={`https://instagram.com/${author.socials.instagram}`} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-pink-600">
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {author.socials.website && (
                    <a href={`https://${author.socials.website}`} target="_blank" rel="noopener noreferrer" className="p-1 text-slate-400 hover:text-slate-800">
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">{author.bio}</p>
              <button
                id="author-posts-view-btn"
                onClick={() => onSelectAuthor(author.id)}
                className={`text-xs font-semibold cursor-pointer transition-colors ${palette.primaryText}`}
              >
                View all articles by {author.name} →
              </button>
            </div>
          </div>
        )}

        {/* Comments section */}
        <div className="mt-12 space-y-8">
          <div className="border-t border-slate-100 pt-8">
            <h3 className={`text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2 ${fonts.titleFont}`}>
              <span>Conversations</span>
              <span className="text-sm font-normal bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-sans">
                {comments.length}
              </span>
            </h3>

            {/* List of comments */}
            {comments.length === 0 ? (
              <p className="text-sm text-slate-400 font-sans italic py-4">No comments yet. Start the conversation!</p>
            ) : (
              <div className="space-y-6">
                {comments.map((comm) => (
                  <div key={comm.id} className="p-4 rounded-xl bg-slate-50/50 border border-slate-100 flex justify-between gap-4">
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-800 font-sans">{comm.authorName}</span>
                        <span className="text-[11px] text-slate-400 font-sans">
                          {new Date(comm.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-sans leading-relaxed">{comm.content}</p>
                    </div>

                    {/* Delete for Admin */}
                    {isAdmin && (
                      <button
                        id={`delete-comment-${comm.id}`}
                        onClick={() => handleCommentDelete(comm.id)}
                        className="text-slate-400 hover:text-red-500 self-start p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete comment"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* New comment form */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <h4 className={`text-lg font-bold text-slate-900 mb-4 ${fonts.titleFont}`}>
              Leave a Reply
            </h4>
            <form onSubmit={handleCommentSubmit} className="space-y-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Name *
                  </label>
                  <input
                    id="comment-name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Email *
                  </label>
                  <input
                    id="comment-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Comment *
                </label>
                <textarea
                  id="comment-text-textarea"
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                id="comment-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 font-semibold text-white text-sm rounded-xl cursor-pointer ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : palette.primaryBg + ' ' + palette.primaryHover
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </form>
          </div>
        </div>
      </article>
    </div>
  );
}
