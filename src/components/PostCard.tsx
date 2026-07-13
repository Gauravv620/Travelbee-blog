import React from 'react';
import { Clock, Eye, ArrowUpRight } from 'lucide-react';
import { Post, Author, ThemeSettings } from '../types';
import { COLOR_PALETTES, FONT_STYLES } from '../utils/theme';

interface PostCardProps {
  key?: React.Key;
  settings: ThemeSettings;
  post: Post;
  authors: Author[];
  onClick: () => void;
}

export default function PostCard({
  settings,
  post,
  authors,
  onClick
}: PostCardProps) {
  const palette = COLOR_PALETTES[settings.primaryColor] || COLOR_PALETTES.emerald;
  const fonts = FONT_STYLES[settings.fontFamily] || FONT_STYLES.editorial;

  const author = authors.find(a => a.id === post.authorId);
  const authorName = author ? author.name : 'Travel Bee Writer';
  const authorAvatar = author ? author.avatar : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&h=80&q=80';

  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <article 
      onClick={onClick}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    >
      {/* Post Hero Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-slate-100">
        <img
          src={post.heroImage}
          alt={post.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className={`text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full text-white shadow-sm ${palette.primaryBg}`}>
            {post.category}
          </span>
        </div>
      </div>

      {/* Post Content Details */}
      <div className="flex-grow p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Metadata Row */}
          <div className="flex items-center space-x-3 text-xs text-slate-400 font-sans">
            <span>{formattedDate}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readingTime}m read</span>
            </span>
            {post.viewCount > 0 && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="flex items-center space-x-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{post.viewCount} views</span>
                </span>
              </>
            )}
          </div>

          {/* Title with elegant icon on hover */}
          <h3 className={`text-lg md:text-xl font-bold text-slate-950 group-hover:text-slate-900 leading-snug tracking-tight transition-colors flex items-start gap-1.5 ${fonts.titleFont}`}>
            <span className="line-clamp-2">{post.title}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0 text-slate-400 mt-1" />
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-slate-600 font-sans line-clamp-2 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Author Bio Snippet */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center space-x-2">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-7 h-7 rounded-full object-cover border border-slate-100"
            />
            <span className="text-xs font-medium text-slate-700 font-sans">{authorName}</span>
          </div>

          {/* Tags */}
          <div className="flex gap-1 overflow-hidden max-w-[50%]">
            {post.tags.slice(0, 1).map((tag, i) => (
              <span key={i} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded font-sans shrink-0 uppercase tracking-wider">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
