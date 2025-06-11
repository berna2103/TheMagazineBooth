'use client'; // This component has interactivity, so it's a client component

import { useState, useTransition } from 'react';
import { sendQuoteRequest } from '@/app/backend/actions';

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
  const [formStatus, setFormStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus(null); // Reset status on new submission

    startTransition(async () => {
      const result = await sendQuoteRequest(formData);
      if (result.success) {
        setFormStatus({ success: true, message: 'Thank you! Your quote request has been sent successfully.' });
        // Optionally reset the form
        // setFormData({ name: '', email: '', ... }); 
      } else {
        setFormStatus({ success: false, message: result.error || 'Something went wrong. Please try again.' });
      }
    });
  };

  return (
    <div className='bg-red-100 min-h-screen flex items-center justify-center pt-8 pb-8'>
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto  p-8 bg-white shadow-lg rounded-lg space-y-6">
      <h2 className="text-3xl font-bold text-center text-gray-800">Get a Quote</h2>

      {/* Service Type */}
      <div className="grid grid-cols-2 gap-4">
        <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${formData.serviceType === 'Rent' ? 'border-gray-700 ring-2 ring-gray-700' : 'border-gray-300'}`}>
          <input type="radio" name="serviceType" value="Rent" checked={formData.serviceType === 'Rent'} onChange={handleChange} className="hidden" />
          <div className="ml-2">
            <h3 className="font-semibold">Rent a Booth</h3>
            <p className="text-sm text-gray-500">For your special event.</p>
          </div>
        </label>
        <label className={`flex items-center p-4 border rounded-lg cursor-pointer ${formData.serviceType === 'Sale' ? 'border-gray-700 ring-2 ring-gray-700'  : 'border-gray-300'}`}>
          <input type="radio" name="serviceType" value="Sale" checked={formData.serviceType === 'Sale'} onChange={handleChange} className="hidden" />
          <div className="ml-2">
            <h3 className="font-semibold">Buy a Booth</h3>
            <p className="text-sm text-gray-500">Own your very own.</p>
          </div>
        </label>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">Event Type</label>
          <select name="eventType" id="eventType" required value={formData.eventType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
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
          <input type="date" name="eventDate" id="eventDate" required value={formData.eventDate} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
          <input type="time" name="startTime" id="startTime" required value={formData.startTime} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
          <input type="time" name="endTime" id="endTime" required value={formData.endTime} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>

       {/* Venue Details */}
      <div>
        <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">Venue Name</label>
        <input type="text" name="venueName" id="venueName" required value={formData.venueName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>
       <div>
        <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700">Venue Address</label>
        <input type="text" name="venueAddress" id="venueAddress" required value={formData.venueAddress} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Additional Questions or Details</label>
        <textarea name="message" id="message" rows={4} value={formData.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
      </div>

      {/* Submit Button & Status */}
      <div>
        <button type="submit" disabled={isPending} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-dark bg-red-100 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
          {isPending ? 'Submitting...' : 'Request My Quote'}
        </button>
      </div>

      {formStatus && (
        <div className={`mt-4 p-4 rounded-md text-center ${formStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {formStatus.message}
        </div>
      )}
    </form>
    </div>
  );
}