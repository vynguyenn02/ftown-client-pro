// components/ZoomableImage.tsx

import React, { useState } from "react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?:string;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({ src, alt }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (isZoomed) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
        onClick={toggleZoom}
      >
        <div className="overflow-hidden w-4/5 h-4/5" onMouseMove={handleMouseMove}>
          <img
            src={src}
            alt={alt}
            style={{
              transform: "scale(2)",
              transformOrigin: transformOrigin,
              transition: "transform 0.1s ease-out",
            }}
          />
        </div>
      </div>
    );
  }

  return <img src={src} alt={alt} onClick={toggleZoom} className="cursor-zoom-in" />;
};

export default ZoomableImage;
