"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Sparkles, MoveHorizontal } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: "4/5" | "3/4" | "16/9" | "1/1";
  className?: string;
  title?: string;
  description?: string;
}

export function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeAlt = "Before Makeover",
  afterAlt = "After HD Bridal Makeover",
  beforeLabel = "Before Makeover",
  afterLabel = "HD Bridal Glam",
  aspectRatio = "4/5",
  className = "",
  title,
  description,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const aspectClass = {
    "4/5": "aspect-[4/5]",
    "3/4": "aspect-[3/4]",
    "16/9": "aspect-[16/9]",
    "1/1": "aspect-square",
  }[aspectRatio];

  return (
    <div className={`space-y-3 ${className}`}>
      {(title || description) && (
        <div className="text-center space-y-1">
          {title && (
            <h3 className="font-heading text-lg sm:text-xl font-bold text-foreground flex items-center justify-center gap-2">
              <Sparkles size={16} className="text-primary" /> {title}
            </h3>
          )}
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden shadow-xl border border-primary/20 select-none cursor-ew-resize group`}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          if (e.touches[0]) handleMove(e.touches[0].clientX);
        }}
      >
        {/* AFTER Image (Full Background) */}
        <div className="absolute inset-0 w-full h-full bg-muted">
          <Image
            src={afterImage}
            alt={afterAlt}
            fill
            sizes="(max-width: 768px) 100vw, 550px"
            className="object-cover object-top pointer-events-none"
            priority
          />
          <div className="absolute bottom-4 right-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-primary shadow-lg">
            {afterLabel}
          </div>
        </div>

        {/* BEFORE Image (Clipped Overlay with CSS inset) */}
        <div
          className="absolute inset-0 h-full overflow-hidden bg-muted pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={beforeImage}
            alt={beforeAlt}
            fill
            sizes="(max-width: 768px) 100vw, 550px"
            className="object-cover object-top pointer-events-none"
            priority
          />
          <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full border border-border/80 text-[10px] sm:text-xs uppercase tracking-widest font-bold text-muted-foreground shadow-lg">
            {beforeLabel}
          </div>
        </div>

        {/* Vertical Divider Handle Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Drag Button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground border-2 border-white shadow-2xl flex items-center justify-center transition-transform group-hover:scale-110">
            <MoveHorizontal size={18} className="animate-pulse" />
          </div>
        </div>

        {/* Floating Hint Overlay on Hover */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-primary/20 text-[10px] font-semibold text-foreground/80 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          Drag slider to compare
        </div>
      </div>
    </div>
  );
}
