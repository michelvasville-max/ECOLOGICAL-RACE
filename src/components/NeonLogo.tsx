import React, { useState, useEffect } from 'react';
import { Building2, Users, Award, ShieldAlert } from 'lucide-react';

interface NeonLogoProps {
  src?: string;
  fallbackType?: 'institution' | 'classroom' | 'project' | 'team';
  sizeClass?: string; // e.g., 'w-20 h-20' or 'w-24 h-24'
  alt?: string;
  className?: string;
}

export default function NeonLogo({
  src,
  fallbackType = 'institution',
  sizeClass = 'w-20 h-20',
  alt = 'Logo',
  className = '',
}: NeonLogoProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);

  // Sync state if src changes
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
  };

  const getFallbackIcon = () => {
    switch (fallbackType) {
      case 'classroom':
        return <Users className="w-1/2 h-1/2 text-emerald-400" />;
      case 'project':
        return <Award className="w-1/2 h-1/2 text-emerald-400" />;
      case 'team':
        return <Users className="w-1/2 h-1/2 text-emerald-400 animate-pulse" />;
      case 'institution':
      default:
        return <Building2 className="w-1/2 h-1/2 text-emerald-400" />;
    }
  };

  // Considerably upscale standard sizes to make them larger
  let computedSizeClass = sizeClass;
  if (sizeClass.includes('w-20 h-20')) {
    computedSizeClass = sizeClass.replace('w-20 h-20', 'w-28 h-28 md:w-32 md:h-32');
  } else if (sizeClass.includes('w-16 h-16')) {
    computedSizeClass = sizeClass.replace('w-16 h-16', 'w-24 h-24');
  } else if (sizeClass.includes('w-12 h-12')) {
    computedSizeClass = sizeClass.replace('w-12 h-12', 'w-20 h-20');
  } else if (sizeClass.includes('w-24 h-24')) {
    computedSizeClass = sizeClass.replace('w-24 h-24', 'w-32 h-32 md:w-36 md:h-36');
  }

  return (
    <div 
      className={`relative rounded-full overflow-hidden border-2 md:border-3 border-emerald-400 bg-emerald-950 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(16,185,129,0.8),inset_0_0_12px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400/20 transition-all duration-300 group-hover:scale-105 ${computedSizeClass} ${className}`}
    >
      {/* Holographic scanner effect line */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent pointer-events-none animate-pulse z-10" />
      
      {imgSrc && !hasError ? (
        <img
          src={imgSrc}
          alt={alt}
          onError={handleError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
        />
      ) : (
        <div className="w-full h-full bg-emerald-950 flex items-center justify-center">
          {getFallbackIcon()}
        </div>
      )}
    </div>
  );
}
