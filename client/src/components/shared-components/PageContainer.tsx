import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="min-h-screen bg-warmscale-7 pt-16">
      <div
        className={`mx-auto max-w-[1200px] px-6 md:px-12 lg:px-16 py-6 ${className}`}
      >
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
