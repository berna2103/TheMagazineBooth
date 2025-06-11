// components/Gallery.jsx
"use client";
import Image from "next/image";

// You can fetch this data from a CMS, API, or define it locally.
const imageData = [
  {
    src: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "A yellow sports car",
  },
  {
    src: "https://images.unsplash.com/photo-1599912027806-cfec9f5944b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "A red classic car",
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "A white porsche",
  },
  {
    src: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "A yellow and black sports car",
  },
  {
    src: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    alt: "A red ferrari",
  },
  {
    src: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80",
    alt: "A classic blue car",
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
              className="group relative h-80 w-full overflow-hidden rounded-lg shadow-lg"
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
