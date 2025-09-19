'use client';

import { useState, useTransition, useEffect, useCallback, useRef } from 'react';
import { LucideTimer, LucideMapPin, LucideDollarSign } from 'lucide-react';
import { sendQuoteRequest } from '@/app/backend/actions';
import html2canvas from 'html2canvas';

const CHICAGO_LAT = 41.8781;
const CHICAGO_LNG = -87.6298;
const BASE_PRICE = 800;
const BASE_HOURS = 6;
const EXTRA_HOUR_RATE = 100;
const MAX_RENTAL_FEE = 1000;
const TRAVEL_FEE = 150;
const TRAVEL_FEE_RADIUS_MILES = 30;

// IMPORTANT: Replace with your actual key in your .env.local file
const OPEN_CAGE_API_KEY = process.env.OPEN_CAGE_API_KEY;

// Helper function to validate address format
const validateAddress = (address) => {
  const regex = /^(?=.*\d+\s\w+)(?=.*[a-zA-Z]{2,})(?=.*\d{5}).*$/;
  return regex.test(address);
};

// Helper function to calculate distance between two lat/lng points using the Haversine formula
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  const distanceMiles = distanceKm * 0.621371;
  return distanceMiles;
};

// Simple debounce function to limit API calls
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export function QuoteForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Wedding',
    eventDate: '',
    startTime: '',
    endTime: '',
    venueName: '',
    venueAddress: '',
    serviceType: 'Rent',
    message: '',
  });

  const [quoteBreakdown, setQuoteBreakdown] = useState({
    basePrice: BASE_PRICE,
    extraHours: 0,
    extraHoursCost: 0,
    travelFee: 0,
    total: BASE_PRICE,
  });

  const [magazineText, setMagazineText] = useState({
    title: 'VOGUE',
    monthYear: 'MONTH YEAR',
    headline: 'BRIGHT FUTURES',
    subline1: 'The Ultimate Grad',
    subline2: 'Party Checklist',
    subline3: 'Top 10 Grad',
    subline4: 'Looks You\'ll Want',
    subline5: 'to Copy',
    gradYear: 'GRADUATE 2025',
  });
  
  const [magazineStyles, setMagazineStyles] = useState({
    fontFamily: 'font-serif',
    textAlign: 'text-left',
  });

  const [formStatus, setFormStatus] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);
  const [addressError, setAddressError] = useState(null);
  const [customImage, setCustomImage] = useState(null);

  const magazineRef = useRef(null);
  const magazineTitleRef = useRef(null);
  const magazineMonthYearRef = useRef(null);
  const magazineHeadlineRef = useRef(null);
  const magazineSubline1Ref = useRef(null);
  const magazineSubline2Ref = useRef(null);
  const magazineSubline3Ref = useRef(null);
  const magazineSubline4Ref = useRef(null);
  const magazineSubline5Ref = useRef(null);
  const magazineGradYearRef = useRef(null);


  const calculateQuote = useCallback(async () => {
    if (formData.serviceType !== 'Rent') {
      setQuoteBreakdown({
        basePrice: 0,
        extraHours: 0,
        extraHoursCost: 0,
        travelFee: 0,
        total: 'Contact for price',
      });
      return;
    }

    setIsCalculating(true);
    setCalculationError(null);

    let travelCost = 0;
    let durationHours = 0;

    if (formData.startTime && formData.endTime) {
      const start = new Date(`2024-01-01T${formData.startTime}:00`);
      const end = new Date(`2024-01-01T${formData.endTime}:00`);
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }
      const durationMs = end.getTime() - start.getTime();
      durationHours = durationMs / (1000 * 60 * 60);
    }

    const extraHours = Math.max(0, Math.ceil(durationHours - BASE_HOURS));
    let extraHoursCost = extraHours * EXTRA_HOUR_RATE;
    const basePrice = BASE_PRICE;

    const totalRentalCost = basePrice + extraHoursCost;
    if (totalRentalCost > MAX_RENTAL_FEE) {
      extraHoursCost = MAX_RENTAL_FEE - basePrice;
    }

    if (formData.venueAddress) {
      if (validateAddress(formData.venueAddress)) {
        try {
          const geocodeUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.venueAddress)}&key=${OPEN_CAGE_API_KEY}`;
          const response = await fetch(geocodeUrl);
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const location = data.results[0].geometry;
            const venueCoords = { lat: location.lat, lng: location.lng };
            const chicagoCoords = { lat: CHICAGO_LAT, lng: CHICAGO_LNG };
            const distance = haversineDistance(chicagoCoords, venueCoords);

            if (distance > TRAVEL_FEE_RADIUS_MILES) {
              travelCost = TRAVEL_FEE;
            }
          } else {
            setCalculationError("Could not verify address. Fee may be applied.");
            travelCost = TRAVEL_FEE;
          }
        } catch (error) {
          setCalculationError("Could not verify address. Fee may be applied.");
          travelCost = TRAVEL_FEE;
        }
      } else {
        setCalculationError("Please enter a valid address (street, city, zip).");
      }
    }

    const total = basePrice + extraHoursCost + travelCost;

    setQuoteBreakdown({
      basePrice,
      extraHours,
      extraHoursCost,
      travelFee: travelCost,
      total,
      durationHours,
    });
    setIsCalculating(false);
  }, [formData.serviceType, formData.venueAddress, formData.startTime, formData.endTime]);

  const debouncedCalculateQuote = useCallback(
    debounce(calculateQuote, 500),
    [calculateQuote]
  );

  useEffect(() => {
    debouncedCalculateQuote();
  }, [formData.venueAddress, formData.startTime, formData.endTime, formData.serviceType, debouncedCalculateQuote]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'venueAddress') {
      if (value && !validateAddress(value)) {
        setAddressError("Please enter a full address including city and zip code.");
      } else {
        setAddressError(null);
      }
    }
  };
  
  const handleMagazineTextChange = (e) => {
    const { name, value } = e.target;
    setMagazineText((prev) => ({ ...prev, [name]: value }));
  };

  const handleMagazineStyleChange = (e) => {
    const { name, value } = e.target;
    setMagazineStyles((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    if (e.target.name === 'venueAddress') {
      calculateQuote();
    }
  };

  const generateImage = useCallback(async () => {
    if (!magazineRef.current) return;
    setIsCalculating(true);
    const canvas = await html2canvas(magazineRef.current, { scale: 2 });
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCustomImage(imageData);
    setIsCalculating(false);
  }, []);

  useEffect(() => {
    const imageHandler = debounce(generateImage, 300);
    imageHandler();
  }, [magazineText, magazineStyles, formData.serviceType, generateImage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus(null);
    if (addressError) {
      setFormStatus({ success: false, message: "Please correct the address before submitting." });
      return;
    }

    startTransition(async () => {
      const result = await sendQuoteRequest({ ...formData, quote: quoteBreakdown, customImage });
      if (result.success) {
        setFormStatus({ success: true, message: 'Thank you! Your quote request has been sent successfully.' });
      } else {
        setFormStatus({ success: false, message: result.error || 'Something went wrong. Please try again.' });
      }
    });
  };

  return (
    <div className='bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className="max-w-4xl w-full p-8 bg-white shadow-xl rounded-2xl border border-gray-200">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Get Your Quote</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Service Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-center p-6 border rounded-xl shadow-sm transition-all duration-300 cursor-pointer ${formData.serviceType === 'Rent' ? 'border-pink-500 ring-2 ring-pink-600 bg-pink-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input type="radio" name="serviceType" value="Rent" checked={formData.serviceType === 'Rent'} onChange={handleChange} className="hidden" />
              <LucideDollarSign className="w-8 h-8 text-pink-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Rent a Booth</h3>
                <p className="text-sm text-gray-500">For your special event.</p>
              </div>
            </label>
            <label className={`flex items-center p-6 border rounded-xl shadow-sm transition-all duration-300 cursor-pointer ${formData.serviceType === 'Sale' ? 'border-pink-600 ring-2 ring-pink-600 bg-pink-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input type="radio" name="serviceType" value="Sale" checked={formData.serviceType === 'Sale'} onChange={handleChange} className="hidden" />
              <LucideMapPin className="w-8 h-8 text-pink-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Buy a Booth</h3>
                <p className="text-sm text-gray-500">Own your very own.</p>
              </div>
            </label>
          </div>
          
          {/* This is the new stacked layout */}
          <div className="grid grid-cols-1 gap-8">
            {/* Magazine Customization Section - Now a full-width column */}
            <div className="p-6 bg-gray-50 rounded-2xl shadow-inner flex flex-col items-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Customize Your Cover</h3>
              
              <div className="space-y-4 w-full mb-8">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Main Title (e.g., VOGUE)</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={magazineText.title}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="monthYear" className="block text-sm font-medium text-gray-700">Month/Year</label>
                  <input
                    type="text"
                    id="monthYear"
                    name="monthYear"
                    value={magazineText.monthYear}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="headline" className="block text-sm font-medium text-gray-700">Headline</label>
                  <input
                    type="text"
                    id="headline"
                    name="headline"
                    value={magazineText.headline}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="gradYear" className="block text-sm font-medium text-gray-700">Graduation Text</label>
                  <input
                    type="text"
                    id="gradYear"
                    name="gradYear"
                    value={magazineText.gradYear}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label htmlFor="subline1" className="block text-sm font-medium text-gray-700">Subline 1</label>
                  <input
                    type="text"
                    id="subline1"
                    name="subline1"
                    value={magazineText.subline1}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                 <div>
                  <label htmlFor="subline2" className="block text-sm font-medium text-gray-700">Subline 2</label>
                  <input
                    type="text"
                    id="subline2"
                    name="subline2"
                    value={magazineText.subline2}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                 <div>
                  <label htmlFor="subline3" className="block text-sm font-medium text-gray-700">Subline 3</label>
                  <input
                    type="text"
                    id="subline3"
                    name="subline3"
                    value={magazineText.subline3}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                 <div>
                  <label htmlFor="subline4" className="block text-sm font-medium text-gray-700">Subline 4</label>
                  <input
                    type="text"
                    id="subline4"
                    name="subline4"
                    value={magazineText.subline4}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                 <div>
                  <label htmlFor="subline5" className="block text-sm font-medium text-gray-700">Subline 5</label>
                  <input
                    type="text"
                    id="subline5"
                    name="subline5"
                    value={magazineText.subline5}
                    onChange={handleMagazineTextChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                {/* Font Selector */}
                <div>
                  <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">Font Family</label>
                  <select
                    id="fontFamily"
                    name="fontFamily"
                    value={magazineStyles.fontFamily}
                    onChange={handleMagazineStyleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="font-serif">Serif (e.g., Times New Roman)</option>
                    <option value="font-sans">Sans-serif (e.g., Arial)</option>
                    <option value="font-mono">Monospace (e.g., Courier New)</option>
                  </select>
                </div>

                {/* Alignment Selector */}
                <div>
                  <label htmlFor="textAlign" className="block text-sm font-medium text-gray-700">Text Alignment</label>
                  <select
                    id="textAlign"
                    name="textAlign"
                    value={magazineStyles.textAlign}
                    onChange={handleMagazineStyleChange}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="text-left">Left</option>
                    <option value="text-center">Center</option>
                    <option value="text-right">Right</option>
                  </select>
                </div>
              </div>

              {/* The magazine container to be "screenshot" */}
              <div ref={magazineRef} className="relative w-full aspect-[3/4] bg-cover bg-no-repeat bg-center rounded-lg overflow-hidden shadow-lg" style={{ backgroundImage: `url('/magazine-booth.jpg')` }}>
                {/* Main Title - VOGUE like text */}
                <div ref={magazineTitleRef} className={`absolute text-white font-bold uppercase tracking-widest ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '12%',
                  left: '14%',
                  width: '72%',
                  fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                  lineHeight: '0.9',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.title}
                </div>

                {/* Month Year */}
                <div ref={magazineMonthYearRef} className={`absolute text-white ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '20.5%',
                  left: '60%',
                  width: '30%',
                  fontSize: 'clamp(0.6rem, 2vw, 1rem)',
                  letterSpacing: '0.1em',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.monthYear}
                </div>
                
                {/* Headline (BRIGHT FUTURES) */}
                <div ref={magazineHeadlineRef} className={`absolute text-white uppercase ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '55%',
                  left: '52%',
                  width: '40%',
                  fontSize: 'clamp(0.8rem, 3vw, 1.5rem)',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.headline}
                </div>

                {/* GRADUATE 2025 */}
                <div ref={magazineGradYearRef} className={`absolute text-white font-bold uppercase ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '65%',
                  left: '52%',
                  width: '40%',
                  fontSize: 'clamp(1rem, 4vw, 2rem)',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.gradYear}
                </div>

                {/* Subline 1 */}
                <div ref={magazineSubline1Ref} className={`absolute text-white ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '63%',
                  left: '12%',
                  width: '40%',
                  fontSize: 'clamp(0.7rem, 2.5vw, 1.2rem)',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.subline1}
                </div>
                {/* Subline 2 */}
                <div ref={magazineSubline2Ref} className={`absolute text-white ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '67%',
                  left: '12%',
                  width: '40%',
                  fontSize: 'clamp(0.7rem, 2.5vw, 1.2rem)',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.subline2}
                </div>
                {/* Subline 3 */}
                <div ref={magazineSubline3Ref} className={`absolute text-white ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '72%',
                  left: '12%',
                  width: '40%',
                  fontSize: 'clamp(0.7rem, 2.5vw, 1.2rem)',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.subline3}
                </div>
                {/* Subline 4 */}
                <div ref={magazineSubline4Ref} className={`absolute text-white ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '76%',
                  left: '12%',
                  width: '40%',
                  fontSize: 'clamp(0.7rem, 2.5vw, 1.2rem)',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.subline4}
                </div>
                {/* Subline 5 */}
                <div ref={magazineSubline5Ref} className={`absolute text-white ${magazineStyles.fontFamily} ${magazineStyles.textAlign}`} style={{
                  top: '80%',
                  left: '12%',
                  width: '40%',
                  fontSize: 'clamp(0.7rem, 2.5vw, 1.2rem)',
                  lineHeight: '1.2',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                  transform: 'rotateZ(-1deg) perspective(100px) rotateY(-2deg) scaleX(1.02)',
                  transformOrigin: 'top left',
                }}>
                  {magazineText.subline5}
                </div>
              </div>
            </div>

            {/* Quote Form Section - Now a full-width column below the magazine section */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">Event Type</label>
                  <select name="eventType" id="eventType" required value={formData.eventType} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Wedding</option>
                    <option>Corporate Event</option>
                    <option>Birthday Party</option>
                    <option>Graduation</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Event Date</label>
                  <input type="date" name="eventDate" id="eventDate" required value={formData.eventDate} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input type="time" name="startTime" id="startTime" required value={formData.startTime} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                  <input type="time" name="endTime" id="endTime" required value={formData.endTime} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>

              {/* Venue Details */}
              <div>
                <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">Venue Name</label>
                <input type="text" name="venueName" id="venueName" required value={formData.venueName} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div>
                <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">Venue Address</label>
                <input type="text" name="venueAddress" id="venueAddress" required value={formData.venueAddress} onChange={handleChange} onBlur={handleBlur} className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none ${addressError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`} />
                {addressError && <p className="mt-2 text-sm text-red-500">{addressError}</p>}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Additional Questions or Details</label>
                <textarea name="message" id="message" rows={4} value={formData.message} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
              
              {/* Quote Summary Section */}
              <div className="p-6 bg-gray-50 rounded-2xl shadow-inner">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <LucideDollarSign className="w-6 h-6 mr-2 text-pink-600" /> Your Quote
                </h3>
                {formData.serviceType === 'Rent' ? (
                  <div>
                    {isCalculating ? (
                      <div className="text-center py-4 text-gray-500 animate-pulse">Calculating quote...</div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-gray-600">
                          <span>Base Rental ({BASE_HOURS} hrs)</span>
                          <span className="font-semibold">${BASE_PRICE.toFixed(2)}</span>
                        </div>
                        {quoteBreakdown.extraHours > 0 && (
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Extra Hours ({quoteBreakdown.extraHours} hrs)</span>
                            <span className="font-semibold">${quoteBreakdown.extraHoursCost.toFixed(2)}</span>
                          </div>
                        )}
                        {quoteBreakdown.travelFee > 0 && (
                          <div className="flex justify-between items-center text-gray-600">
                            <span>Travel Fee</span>
                            <span className="font-semibold">${quoteBreakdown.travelFee.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="border-t pt-4 mt-4 flex justify-between items-center text-xl font-bold">
                          <span>Total Quote</span>
                          <span className="text-pink-500">
                            {typeof quoteBreakdown.total === 'number'
                              ? `$${quoteBreakdown.total.toFixed(2)}`
                              : quoteBreakdown.total}
                          </span>
                        </div>
                        {calculationError && (
                          <p className="text-sm text-red-500 mt-2">{calculationError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-4 italic">
                          * Based on a rental fee up to $${MAX_RENTAL_FEE} and a ${TRAVEL_FEE} travel fee for locations over ${TRAVEL_FEE_RADIUS_MILES} miles from Chicago.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Please contact us for a personalized quote.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button & Status */}
          <div className="pt-4">
            <button type="submit" disabled={isPending || isCalculating || addressError} className="w-full flex justify-center py-4 px-6 border border-transparent rounded-full shadow-sm text-lg font-bold text-pink-500 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isPending ? 'Sending...' : 'Request My Quote'}
            </button>
          </div>

          {formStatus && (
            <div className={`mt-4 p-4 rounded-lg text-center ${formStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {formStatus.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}