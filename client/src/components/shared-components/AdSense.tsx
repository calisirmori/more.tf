import { useEffect, useRef } from 'react';

interface AdSenseProps {
  /**
   * Ad slot ID from Google AdSense (e.g., "1234567890")
   * Create ad units at: https://adsense.google.com
   */
  adSlot: string;

  /**
   * Ad format
   * - 'display': Standard display ad (responsive)
   * - 'horizontal': Horizontal banner
   * - 'vertical': Vertical banner
   * - 'rectangle': Rectangle/square ad
   */
  adFormat?: 'display' | 'horizontal' | 'vertical' | 'rectangle';

  /**
   * Custom styles for the ad container
   */
  style?: React.CSSProperties;

  /**
   * Custom className for the ad container
   */
  className?: string;

  /**
   * Test mode - shows placeholder instead of real ad
   */
  testMode?: boolean;
}

const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = 'display',
  style = {},
  className = '',
  testMode = false,
}) => {
  const adRef = useRef<HTMLModElement>(null);
  const isAdPushed = useRef(false);

  useEffect(() => {
    // Only push ads once per mount
    if (!isAdPushed.current && !testMode) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdPushed.current = true;
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [testMode]);

  // Test mode placeholder
  if (testMode) {
    return (
      <div
        className={`bg-warmscale-7 border-2 border-dashed border-warmscale-5 rounded-md flex items-center justify-center ${className}`}
        style={{
          minHeight: '250px',
          ...style,
        }}
      >
        <div className="text-center p-4">
          <div className="text-lightscale-4 font-semibold mb-2">
            AdSense Ad Placeholder
          </div>
          <div className="text-lightscale-6 text-sm">
            Slot: {adSlot}
          </div>
          <div className="text-lightscale-6 text-xs mt-1">
            (Test mode - real ads will show in production)
          </div>
        </div>
      </div>
    );
  }

  const defaultStyle: React.CSSProperties = {
    display: 'block',
    minHeight: '250px',
    ...style,
  };

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={defaultStyle}
        data-ad-client="ca-pub-1993891349433838"
        data-ad-slot={adSlot}
        data-ad-format={adFormat === 'display' ? 'auto' : adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSense;
