"use client";

import Script from "next/script";
import CalendlyPopupButton from "./CalendlyPopUp";  
export function Cta() {


  return (
    <>
      {/* Calendly Script */}
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />

      <section id="rent" className="bg-white ">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-serif font-extrabold tracking-tight text-zinc-800 sm:text-4xl">
              Ready to Make Your Event Unforgettable? But Not Sure If You Want to Rent or Buy?
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-gray-600">
              Don&apos;t just host a party—create a headline-worthy event. Book the
              Magazine Booth and give your guests a memory they can take home.
            </p>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
             <CalendlyPopupButton />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
