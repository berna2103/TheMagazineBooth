import { Camera, Sparkles, Smartphone } from 'lucide-react';


const features = [
  {
    icon: <Camera size={32} className="text-gray-700" />,
    title: 'Your Phone, Your Cover Shot!',
    description: 'Step inside our **illuminated magazine-style box** and use your own smartphone to snap your perfect cover photo! The unique setting provides the ideal lighting and backdrop to transform your everyday photo into a magazine-worthy masterpiece.',
  },
  {
    icon: <Sparkles size={32} className="text-gray-700" />,
    title: 'High-End Design & Style',
    description: "Our sleek, minimalist design isn't just about looks – it's meticulously crafted to complement your venue’s aesthetic and provide a beautifully lit, customizable backdrop for your unique magazine cover moment.",
  },
  {
    icon: <Smartphone size={32} className="text-gray-700" />,
    title: 'Instant Digital Memories',
    description: 'Since you’re using your own device, your high-resolution photos and GIFs are instantly on your phone, ready to be shared across social media with your custom event hashtag – no waiting, no emailing!',
  },
];
export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
          <div className="lg:col-span-1">
            <h2 className="text-4xl font-serif font-extrabold text-gray-900 sm:text-4xl">
              Capture the Moment in Style, Magazine Photo Booth Rental in Chicago and Northwest Indiana!
            </h2>
            <p className="mt-8 text-lg text-gray-500">
               Ready to make your event truly unforgettable? With our sleek and stylish Magazine Photo Booth Rental, your Chicago celebration will transform into an instant red-carpet affair. It&apos;s the perfect addition for weddings, corporate events, private parties, and any occasion where you want guests to feel like a cover star! </p>
          </div>
          <div className="mt-12 lg:mt-0 lg:col-span-2 bg-red-100 p-8 rounded-lg shadow-lg">
            <dl className="space-y-10 sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-x-6 sm:gap-y-10 lg:gap-x-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex">
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-bold text-gray-900">{feature.title}</dt>
                    <dd className="mt-2 text-base text-gray-500">{feature.description}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}