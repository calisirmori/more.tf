import { useState } from 'react';

interface HoloEffectProps {
  isActive: boolean;
  maskUrl?: string;
  children: React.ReactNode;
  disableTilt?: boolean;
}

const HoloEffect: React.FC<HoloEffectProps> = ({
  isActive,
  maskUrl = '/player cards/8rqqgH01 (2).svg',
  children,
  disableTilt = false,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 120, y: 168 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    if (!isActive) return;
    setMousePosition({ x: 120, y: 168 }); // Reset to center
  };

  // Calculate background position for spotlight
  const rect = { width: 240, height: 336 };
  const bgX = (mousePosition.x / rect.width) * 100;
  const bgY = (mousePosition.y / rect.height) * 100;
  const backgroundPosition = `${bgX}% ${bgY}%`;

  // Calculate 3D tilt (only if not disabled)
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((mousePosition.y - centerY) / centerY) * -10;
  const rotateY = ((mousePosition.x - centerX) / centerX) * 10;
  const cardTransform =
    isActive && !disableTilt
      ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      : 'none';

  return (
    <div
      className="relative w-full h-full"
      onMouseMove={isActive ? handleMouseMove : undefined}
      onMouseLeave={isActive ? handleMouseLeave : undefined}
      style={{
        transformStyle: isActive && !disableTilt ? 'preserve-3d' : undefined,
        transform: cardTransform,
        transition: disableTilt ? undefined : 'transform 0.1s ease-out',
      }}
    >
      {children}

      {isActive && (
        <>
          {/* Animated holographic gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  0deg,
                  rgb(255, 119, 115) 0%,
                  rgba(255, 237, 95, 1) 8%,
                  rgba(168, 255, 95, 1) 16%,
                  rgba(131, 255, 247, 1) 24%,
                  rgba(120, 148, 255, 1) 32%,
                  rgb(216, 117, 255) 40%,
                  rgb(255, 119, 115) 48%,
                  rgba(255, 237, 95, 1) 56%,
                  rgba(168, 255, 95, 1) 64%,
                  rgba(131, 255, 247, 1) 72%,
                  rgba(120, 148, 255, 1) 80%,
                  rgb(216, 117, 255) 88%,
                  rgb(255, 119, 115) 96%
                ),
                repeating-linear-gradient(
                  133deg,
                  #0e152e 0%,
                  hsl(180, 10%, 60%) 3.8%,
                  hsl(180, 29%, 66%) 4.5%,
                  hsl(180, 10%, 60%) 5.2%,
                  #0e152e 10%,
                  #0e152e 12%
                )
              `,
              backgroundSize: '300% 300%, 200% 200%',
              backgroundBlendMode: 'multiply',
              animation: 'holoGradient 60s ease infinite',
              mixBlendMode: 'color-dodge',
              opacity: 0.8,
              WebkitMaskImage: `url("${maskUrl}")`,
              maskImage: `url("${maskUrl}")`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />

          {/* Mouse-following shine */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                radial-gradient(
                  circle at ${backgroundPosition},
                  rgba(255, 255, 255, 0.5) 0%,
                  rgba(255, 255, 255, 0.1) 30%,
                  transparent 60%
                )
              `,
              mixBlendMode: 'overlay',
              WebkitMaskImage: `url("${maskUrl}")`,
              maskImage: `url("${maskUrl}")`,
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
            }}
          />
        </>
      )}

      <style>{`
        @keyframes holoGradient {
          0% {
            background-position: 0% 0%;
          }
          25% {
            background-position: 50% 100%;
          }
          50% {
            background-position: 100% 50%;
          }
          75% {
            background-position: 50% 0%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </div>
  );
};

export default HoloEffect;
