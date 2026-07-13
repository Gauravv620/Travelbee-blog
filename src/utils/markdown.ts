/**
 * A simple, safe markdown renderer that compiles core markdown constructs
 * into styled HTML strings, applying custom classes and referrerPolicy.
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;

  // 1. Blockquotes
  html = html.replace(/^>\s+(.*?)$/gm, '<blockquote class="border-l-4 border-slate-400 pl-4 py-1 italic my-4 text-slate-600 bg-slate-50/50 rounded-r-md">$1</blockquote>');

  // 2. Headers (must be processed line by line or with anchor bounds)
  html = html.replace(/^#\s+(.*?)$/gm, '<h1 class="text-3xl md:text-4xl font-bold text-slate-900 mt-8 mb-4 tracking-tight font-serif">$1</h1>');
  html = html.replace(/^##\s+(.*?)$/gm, '<h2 class="text-2xl font-bold text-slate-800 mt-6 mb-3 tracking-tight font-serif">$1</h2>');
  html = html.replace(/^###\s+(.*?)$/gm, '<h3 class="text-xl font-semibold text-slate-800 mt-4 mb-2">$1</h3>');

  // 3. Images with referrerPolicy="no-referrer"
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="my-6 overflow-hidden rounded-xl bg-slate-100 shadow-sm"><img src="$2" alt="$1" class="w-full object-cover max-h-[480px] hover:scale-[1.01] transition-transform duration-300" referrerpolicy="no-referrer" /><p class="text-xs text-slate-400 mt-2 py-1 text-center font-sans">$1</p></div>');

  // 4. Bold / Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 5. Unordered Lists
  html = html.replace(/^-\s+(.*?)$/gm, '<li class="list-disc ml-6 text-slate-700 my-1 font-sans">$1</li>');

  // 6. Ordered Lists
  html = html.replace(/^\d+\.\s+(.*?)$/gm, '<li class="list-decimal ml-6 text-slate-700 my-1 font-sans">$1</li>');

  // 7. Paragraphs - Split double newlines and wrap in p tags if not HTML block elements
  const blocks = html.split(/\n\s*\n/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (
      trimmed.startsWith('<h') || 
      trimmed.startsWith('<div') || 
      trimmed.startsWith('<blockquote') || 
      trimmed.startsWith('<li') || 
      trimmed.startsWith('<ul') || 
      trimmed.startsWith('<ol')
    ) {
      return trimmed;
    }
    return `<p class="text-slate-700 leading-relaxed mb-4 text-base md:text-lg font-sans">${trimmed.replace(/\n/g, '<br />')}</p>`;
  });

  return formattedBlocks.join('\n');
}
