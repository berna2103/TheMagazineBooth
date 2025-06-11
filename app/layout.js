import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script"; // <-- 1. Import the Script component
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata = {
  title: "The Magazine Booth | High-Fashion Photo Booth Rental and Sales",
  description: "Rent the exclusive photo booth featured in VIP events. Elevate your event with a touch of glamour.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}

        {/* 2. Add the Calendly script here, just before the closing body tag */}
        <Script
          src="https://assets.calendly.com/assets/external/widget.js"
          strategy="lazyOnload" // This loads the script efficiently
          async
        />
      </body>
    </html>
  );
}