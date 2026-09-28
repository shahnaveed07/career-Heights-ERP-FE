import { useState } from 'react';
const SIZE_CLASSES = {
  xs: {
    img: 'h-6 w-6 rounded-full object-cover',
    fallback:
      'h-6 w-6 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[9px] shadow-2xs border border-blue-200',
  },
  sm: {
    img: 'h-7 w-7 rounded-full object-cover',
    fallback:
      'h-7 w-7 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[10px] shadow-2xs border border-blue-200',
  },
  md: {
    img: 'h-8 w-8 rounded-full object-cover',
    fallback:
      'h-8 w-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs shadow-2xs border border-blue-200',
  },
  lg: {
    img: 'h-12 w-12 rounded-full object-cover ring-2 ring-blue-900/20',
    fallback:
      'h-12 w-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm shadow-2xs border border-blue-200 ring-2 ring-blue-900/20',
  },
  xl: {
    img: 'h-16 w-16 rounded-full object-cover ring-2 ring-blue-900/20',
    fallback:
      'h-16 w-16 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-base shadow-2xs border border-blue-200 ring-2 ring-blue-900/20',
  },
};
export const StudentAvatar = ({
  src,
  photo,
  name,
  size = 'md',
  className,
  fallbackClassName,
}) => {
  const [imgError, setImgError] = useState(false);
  const imageSource = photo || src;
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const resolvedImgClass = className || sizeConfig.img;
  const resolvedFallbackClass = fallbackClassName || sizeConfig.fallback;
  const cleanName = (name || '').trim();
  const parts = cleanName ? cleanName.split(/\s+/) : [];
  let initials = 'U';
  if (parts.length === 1 && parts[0]) {
    initials = parts[0][0].toUpperCase();
  } else if (parts.length >= 2) {
    initials = ((parts[0][0] || '') + (parts[1][0] || '')).toUpperCase();
  }

  if (!imageSource || imgError) {
    return (
      <div className={resolvedFallbackClass} title={cleanName || 'User'} aria-label={cleanName || 'User'}>
        <span>{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={imageSource}
      alt={cleanName || 'User Avatar'}
      className={resolvedImgClass}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
};

export const UserAvatar = StudentAvatar;
