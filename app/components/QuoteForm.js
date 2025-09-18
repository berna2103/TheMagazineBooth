'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { LucideTimer, LucideMapPin, LucideDollarSign } from 'lucide-react';
import { sendQuoteRequest } from '@/app/backend/actions';

const CHICAGO_LAT = 41.8781;
const CHICAGO_LNG = -87.6298;
const BASE_PRICE = 800;
const BASE_HOURS = 6;
const EXTRA_HOUR_RATE = 100;
const MAX_RENTAL_FEE = 1000; // New constant for the rental fee cap
const TRAVEL_FEE = 150;
const TRAVEL_FEE_RADIUS_MILES = 30;

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
  const distanceMiles = distanceKm * 0.621371; // Convert km to miles
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

  const [formStatus, setFormStatus] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState(null);

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
    
    // Calculate duration in hours
    if (formData.startTime && formData.endTime) {
      const start = new Date(`2024-01-01T${formData.startTime}:00`);
      const end = new Date(`2024-01-01T${formData.endTime}:00`);
      if (end < start) {
        // Handle overnight events
        end.setDate(end.getDate() + 1);
      }
      const durationMs = end.getTime() - start.getTime();
      durationHours = durationMs / (1000 * 60 * 60);
    }
    
    // Calculate extra hours and cost
    const extraHours = Math.max(0, Math.ceil(durationHours - BASE_HOURS));
    let extraHoursCost = extraHours * EXTRA_HOUR_RATE;
    const basePrice = BASE_PRICE;
    
    // 💡 NEW LOGIC: Cap the rental fee at MAX_RENTAL_FEE
    const totalRentalCost = basePrice + extraHoursCost;
    if (totalRentalCost > MAX_RENTAL_FEE) {
      extraHoursCost = MAX_RENTAL_FEE - basePrice;
    }
    
    // Calculate travel fee if address is provided
    if (formData.venueAddress) {
      try {
        // 🚨 IMPORTANT: Replace 'YOUR_GOOGLE_MAPS_API_KEY' with your actual key
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.venueAddress)}&key=YOUR_GOOGLE_MAPS_API_KEY`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          const venueCoords = { lat: location.lat, lng: location.lng };
          const chicagoCoords = { lat: CHICAGO_LAT, lng: CHICAGO_LNG };
          const distance = haversineDistance(chicagoCoords, venueCoords);

          if (distance > TRAVEL_FEE_RADIUS_MILES) {
            travelCost = TRAVEL_FEE;
          }
        } else {
          setCalculationError("Could not verify address for travel fee. Fee may be applied.");
          travelCost = TRAVEL_FEE; // Assume travel fee if address verification fails
        }
      } catch (error) {
        setCalculationError("Could not verify address for travel fee. Fee may be applied.");
        travelCost = TRAVEL_FEE;
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

  // Use a debounced effect for the address field to limit API calls
  useEffect(() => {
    const handler = debounce(calculateQuote, 500);
    handler();
  }, [formData.venueAddress, formData.startTime, formData.endTime, calculateQuote]);
  
  useEffect(() => {
    calculateQuote();
  }, [formData.serviceType, calculateQuote]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus(null);

    startTransition(async () => {
      const result = await sendQuoteRequest({ ...formData, quote: quoteBreakdown });
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
            <label className={`flex items-center p-6 border rounded-xl shadow-sm transition-all duration-300 cursor-pointer ${formData.serviceType === 'Rent' ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input type="radio" name="serviceType" value="Rent" checked={formData.serviceType === 'Rent'} onChange={handleChange} className="hidden" />
              <LucideDollarSign className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Rent a Booth</h3>
                <p className="text-sm text-gray-500">For your special event.</p>
              </div>
            </label>
            <label className={`flex items-center p-6 border rounded-xl shadow-sm transition-all duration-300 cursor-pointer ${formData.serviceType === 'Sale' ? 'border-indigo-600 ring-2 ring-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input type="radio" name="serviceType" value="Sale" checked={formData.serviceType === 'Sale'} onChange={handleChange} className="hidden" />
              <LucideMapPin className="w-8 h-8 text-indigo-600 mr-4" />
              <div>
                <h3 className="font-semibold text-lg">Buy a Booth</h3>
                <p className="text-sm text-gray-500">Own your very own.</p>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
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
                <input type="text" name="venueAddress" id="venueAddress" required value={formData.venueAddress} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Additional Questions or Details</label>
                <textarea name="message" id="message" rows={4} value={formData.message} onChange={handleChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
              </div>
            </div>

            {/* Quote Summary Section */}
            <div className="lg:col-span-1 p-6 bg-gray-50 rounded-2xl shadow-inner">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <LucideDollarSign className="w-6 h-6 mr-2 text-indigo-600" /> Your Quote
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

          {/* Submit Button & Status */}
          <div className="pt-4">
            <button type="submit" disabled={isPending || isCalculating} className="w-full flex justify-center py-4 px-6 border border-transparent rounded-full shadow-sm text-lg font-bold text-pink-500 bg-white hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
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