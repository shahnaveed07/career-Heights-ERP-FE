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
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || '')
      .join('') || 'ST';
  if (!imageSource || imgError) {
    return (
      <div className={resolvedFallbackClass} title={name} aria-label={name}>
        <span>{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={imageSource}
      alt={name}
      className={resolvedImgClass}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
};
