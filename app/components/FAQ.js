"use client"; // This is essential for using state and event handlers

import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqData = [
  {
    question: "What areas do you service?",
    answer: "We proudly serve the city of Chicago and its surrounding suburbs. Our standard service area covers locations within a 30-mile radius of downtown Chicago. Please contact us for a custom quote if your event is located further out."
  },
  {
    question: "How much does it cost to rent the Vogue Booth?",
    answer: "Our pricing starts at $350 for a 2-hour rental, which is perfect for smaller events and intimate gatherings. This includes delivery, setup, and a professional on-site attendant."
  },
  {
    question: "What are the dimensions of the booth?",
    answer: "You'll need a space of at least 8 feet by 8 feet to accommodate the Vogue Booth comfortably. This allows for a seamless experience for your guests and ensures that everyone can fit in the frame. The ceiling height should be at least 7 feet to allow for the backdrop setup."
  },
  {
    question: "Do you offer a full-day package?",
    answer: "Absolutely! For major events, our full-day package provides up to 8 hours of service for $700. This is our best value option."
  },
  {
    question: "Are there any hidden fees?",
    answer: "We believe in transparent pricing. A setup and travel fee may apply based on your location. However, we are happy to completely waive this fee for all full-day rentals as a thank you for booking with us."
  },
  {
    question: "What's included in every rental?",
    answer: "Every Vogue Booth rental includes unlimited photo sessions, a curated set of high-fashion props, instant digital sharing for your guests, and a complete online gallery of all the photos after your event."
  }
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-extrabold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Have questions? We have answers.
          </p>
        </div>
        <div className="mt-12">
          <dl className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border-b-2 border-gray-100 py-6">
                <dt>
                  <button 
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex justify-between items-start text-left text-gray-900"
                  >
                    <span className="text-lg font-medium">{faq.question}</span>
                    <span className="ml-6 h-7 flex items-center">
                      {openIndex === index ? <Minus /> : <Plus />}
                    </span>
                  </button>
                </dt>
                {/* Accordion content with smooth transition */}
                <dd className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                  <p className="text-base text-gray-500">
                    {faq.answer}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}