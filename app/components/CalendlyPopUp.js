// components/CalendlyPopupButton.tsx
"use client";

import { PopupButton } from "react-calendly";
import { useEffect, useState } from "react";

export default function CalendlyPopupButton() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <PopupButton
      url="https://calendly.com/barciastech/30min"
      rootElement={document.body}
      text="Call Us!"
      className="inline-block bg-white text-black font-bold py-3 px-8 text-lg hover:bg-red-50 transition-colors duration-300"
    />
  );
}
