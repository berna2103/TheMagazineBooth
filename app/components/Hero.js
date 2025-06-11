"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import CalendlyPopupButton from "./CalendlyPopUp";

// Images must be inside /public/
const carouselImages = [
  '/hero.jpg',
  '/hero.jpg',
];

export function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );

  const [opacity, setOpacity] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;

    const handleScroll = () => {
      const scrollProgress = emblaApi.scrollProgress();
      const newOpacity = 1 - Math.abs(scrollProgress % 1);
      setOpacity(newOpacity < 0.1 ? 0 : newOpacity);
    };

    const handleSelect = () => {
      setActiveIndex(emblaApi.selectedScrollSnap());
      setOpacity(1);
    };

    emblaApi.on('scroll', handleScroll);
    emblaApi.on('select', handleSelect);
    handleSelect();

    return () => {
      emblaApi.off('scroll', handleScroll);
      emblaApi.off('select', handleSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative hero_background w-full h-screen flex items-center justify-center bg-red-100">
      {/* Overlay for the whole section */}
      <div className="absolute inset-0 bg-red-100 bg-opacity-50"></div>

      {/* Main content container with flexbox for side-by-side layout */}
      <div className="relative z-3 w-full h-full flex flex-col md:flex-row items-center justify-center">
        {/* Content Section (left) */}
        <div className="flex-1 text-center text-white text-zinc-900 px-4 py-8 md:py-0">
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-zinc-900 tracking-tight">
            The Magazine Booth
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl">
            Bring glamour to your Chicago event!
          </p>
          <div className="mt-8">
            <CalendlyPopupButton />
          </div>
        </div>

        {/* Carousel Section (right) */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center">
          {/* Embla Viewport */}
          <div className="w-full h-full" ref={emblaRef}>
            {/* Embla Container */}
            <div className="flex h-full">
              {carouselImages.map((src, index) => (
                <div key={index} className="relative flex-shrink-0 w-full h-full">
                  <Image
                    src={src}
                    alt={`Carousel image ${index + 1}`}
                    objectFit='cover'
                    layout='fill'
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Optional: Add an overlay to the carousel if desired */}
          {/* <div className="absolute inset-0 bg-black bg-opacity-20"></div> */}
        </div>
      </div>
    </section>
  );
}