import React, { useRef, useEffect, useState } from 'react';
import HoloEffect from './HoloEffect';

interface PlayerCardProps {
  // Card data
  cardUrl?: string;
  seasonid?: number;
  seasonName?: string;
  division?: string;
  playerClass?: string;

  // Visual effects
  holo?: boolean;
  animated?: boolean;

  // Canvas rendering (fallback)
  useCanvas?: boolean;
  canvasRenderer?: () => void;
  canvasRef?: React.RefObject<HTMLCanvasElement>;

  // Styling
  className?: string;
  imageClassName?: string;
  containerClassName?: string;

  // Event handlers
  onClick?: () => void;
  onError?: () => void;

  // Animation config
  enable3DTilt?: boolean;
  tiltIntensity?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  cardUrl,
  seasonid,
  seasonName,
  division,
  playerClass,
  holo = false,
  animated: isAnimated = false,
  useCanvas = false,
  canvasRenderer,
  canvasRef,
  className = '',
  imageClassName = '',
  containerClassName = '',
  onClick,
  onError,
  enable3DTilt = true,
  tiltIntensity = 10,
}) => {
  const internalCardRef = useRef<HTMLDivElement>(null);
  const tiltWrapperRef = useRef<HTMLDivElement>(null);
  const cardRefToUse = canvasRef || internalCardRef;

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Mouse interaction for 3D tilt (same as HoloEffect)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enable3DTilt) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    if (!enable3DTilt) return;
    // Reset to center for neutral position
    const card = tiltWrapperRef.current;
    if (!card) {
      setMousePosition({ x: 0, y: 0 });
      return;
    }
    const rect = card.getBoundingClientRect();
    setMousePosition({ x: rect.width / 2, y: rect.height / 2 });
  };

  // Calculate 3D tilt (same calculation as HoloEffect)
  const [tiltTransform, setTiltTransform] = useState(
    'perspective(1000px) rotateX(0deg) rotateY(0deg)'
  );

  useEffect(() => {
    let newTransform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';

    if (!enable3DTilt) {
      newTransform = 'none';
    } else {
      const card = tiltWrapperRef.current;
      if (!card) {
        newTransform = 'none';
      } else {
        const rect = card.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // If no mouse position yet, use neutral (no tilt)
        if (mousePosition.x !== 0 || mousePosition.y !== 0) {
          const rotateX = ((mousePosition.y - centerY) / centerY) * -10;
          const rotateY = ((mousePosition.x - centerX) / centerX) * 10;
          newTransform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
      }
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTiltTransform(newTransform);
  }, [enable3DTilt, mousePosition]);

  // Canvas rendering
  if (useCanvas) {
    if (!canvasRef) {
      console.error(
        'PlayerCard: useCanvas is true but canvasRef is not provided'
      );
      return null;
    }

    return (
      <div className={containerClassName}>
        {enable3DTilt ? (
          <div
            ref={tiltWrapperRef}
            style={{
              transform: tiltTransform,
              transformStyle: 'preserve-3d',
              transition: 'transform 0.1s ease-out',
              background: 'none',
              width: '100%',
              height: '100%',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
          >
            <canvas
              ref={canvasRef}
              width="550"
              height="750"
              className={imageClassName}
              style={{ transform: `scale(0.55)`, transformOrigin: 'top left' }}
            />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width="550"
            height="750"
            className={`${className} ${imageClassName}`}
            style={{ transform: `scale(0.55)`, transformOrigin: 'top left' }}
          />
        )}
      </div>
    );
  }

  // Image rendering with optional holo effect
  const cardImage = (
    <img
      src={cardUrl}
      alt={seasonName || `Player Card ${seasonid || ''}`}
      className={`w-full h-auto object-contain ${imageClassName}`}
      onClick={onClick}
      onError={onError}
    />
  );

  // Wrap in tilt container if enabled
  const tiltWrapper = (content: React.ReactNode) => {
    if (!enable3DTilt) return content;

    return (
      <div
        ref={tiltWrapperRef}
        style={{
          transform: tiltTransform,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
          width: '100%',
          height: '100%',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {content}
      </div>
    );
  };

  // Apply holo effect if needed, then wrap in tilt if enabled
  if (holo && enable3DTilt) {
    // Modal view: HoloEffect with disableTilt=true, wrapped in PlayerCard's uniform tilt
    const holoContent = (
      <HoloEffect isActive={true} disableTilt={true}>
        {cardImage}
      </HoloEffect>
    );
    const content = tiltWrapper(holoContent);

    return (
      <div className={`${containerClassName} ${className}`}>{content}</div>
    );
  } else if (holo && !enable3DTilt) {
    // Grid view: HoloEffect visible with disableTilt=true (no tilt, only visual effects)
    return (
      <div className={`${containerClassName} ${className}`}>
        <HoloEffect isActive={true} disableTilt={true}>
          {cardImage}
        </HoloEffect>
      </div>
    );
  } else if (!holo && enable3DTilt) {
    // Modal view: Non-holo card with PlayerCard's tilt
    const content = tiltWrapper(cardImage);

    return (
      <div className={`${containerClassName} ${className}`}>{content}</div>
    );
  } else {
    // Grid view: Non-holo card without tilt
    return (
      <div className={`${containerClassName} ${className}`}>{cardImage}</div>
    );
  }
};

export default PlayerCard;
