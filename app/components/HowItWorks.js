import Image from "next/image";
export function HowItWorks() {
  return (
    <section className="py-20 bg-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-serif font-extrabold text-gray-900">A Seamless Experience</h2>
        <p className="mt-4 text-lg text-gray-500">Bringing high fashion fun to your event in three simple steps.</p>
        
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-2xl font-serif">
              1
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">Reserve Your Date</h3>
            <p className="mt-2 text-base text-gray-500">Book your event date and choose from our curated packages and backdrops.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-2xl font-serif">
              2
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">We Handle Everything</h3>
            <p className="mt-2 text-base text-gray-500">Our attendant delivers, sets up, and stays to ensure a perfect experience for your guests.</p>
          </div>
          <div className="flex flex-col items-center">
             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white border-2 border-gray-900 text-gray-900 font-bold text-2xl font-serif">
              3
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">Enjoy Your Gallery</h3>
            <p className="mt-2 text-base text-gray-500">After the event, receive a full online gallery of every priceless moment captured.</p>
          </div>
        </div>
      </div>
    </section>
  );
}