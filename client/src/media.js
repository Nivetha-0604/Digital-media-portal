export const ytId = url => {
  const m = (url || '').match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
};
export const ytThumb = id => `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
export const guessType = url => {
  const u = (url || '').split('?')[0].toLowerCase();
  if (/\.(mp3|wav|ogg|m4a|aac|flac)$/.test(u)) return 'audio';
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(u)) return 'image';
  return 'video';
};
export const looksDirect = url => !!ytId(url) || /\.(mp4|webm|ogg|mov|mp3|wav|m4a|aac|jpg|jpeg|png|gif|webp)(\?|$)/i.test(url || '');
