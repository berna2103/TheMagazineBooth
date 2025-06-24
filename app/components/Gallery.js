// components/Gallery.jsx
"use client";
import Image from "next/image";

// You can fetch this data from a CMS, API, or define it locally.
const imageData = [
  {
    src: "/1.jpeg",
    alt: "photo booth",
  },
  {
    src: "/2.jpeg",
    alt: "A red classic car",
  },
  {
    src: "/3.jpeg",
    alt: "A red classic car",
  },
  {
    src: "/4.jpeg",
    alt: "A red classic car",
  },
  {
    src: "/5.jpeg",
    alt: "A red classic car",
  },
  {
    src: "/6.jpeg",
    alt: "A red classic car",
  },
];

export function Gallery() {
  return (
    <div className="bg-red-100">
     <div className="text-center py-8">
      <h2 className="text-3xl font-serif font-extrabold text-gray-900 sm:text-4xl">
        Celebrating Together, One Event at a Time
      </h2>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {imageData.map((image, index) => (
            <div
              key={index}
              className="group relative h-160 w-full overflow-hidden rounded-lg shadow-lg"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-110"
                priority={index < 3} // Prioritize loading for the first few images
              />
              {/* Optional: Add an overlay or text on hover */}
              <div className="absolute inset-0 bg-red-100 bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-lg font-bold">{image.alt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
