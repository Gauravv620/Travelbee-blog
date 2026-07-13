export interface ThemeSettings {
  primaryColor: 'emerald' | 'sky' | 'orange' | 'amber' | 'zinc';
  fontFamily: 'editorial' | 'modern' | 'minimal';
  heroLayout: 'carousel' | 'static' | 'minimal';
  activeSections: {
    hero: boolean;
    featured: boolean;
    latest: boolean;
    curated: boolean;
    newsletter: boolean;
  };
  siteName: string;
  siteDescription: string;
}

export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  publishedAt: string; // ISO String
  scheduledFor: string | null; // ISO String
  authorId: string;
  heroImage: string;
  gallery: string[];
  category: string;
  tags: string[];
  isFeatured: boolean;
  viewCount: number;
  readingTime: number; // minutes
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  role: 'Admin' | 'Editor' | 'Author';
  socials: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  altText: string;
  category: string;
  uploadedAt: string;
}

export interface Revision {
  id: string;
  postId: string;
  title: string;
  content: string;
  excerpt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}
