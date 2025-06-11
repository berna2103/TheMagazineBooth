'use server'; // This directive marks all functions in this file as Server Actions

import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.QUOTE_RECIPIENT_EMAIL;

// The core server action function
// We remove the TypeScript type annotation from the 'data' parameter
export async function sendQuoteRequest(data) {
  if (!recipientEmail) {
    console.error("Recipient email is not configured.");
    return { success: false, error: "Server configuration error." };
  }

  try {
    // 1. Send the notification email to yourself
    await resend.emails.send({
      from: 'Quote Request <bernardo.jimenezz@gmail.com>', // Use the Resend default for testing
      to: recipientEmail,
      subject: `New Photo Booth Quote Request - ${data.eventType}`,
      reply_to: data.email,
      html: `
        <h1>New Photo Booth Quote Request</h1>
        <p><strong>Service Type:</strong> ${data.serviceType}</p>
        <hr>
        <h2>Contact Details</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <hr>
        <h2>Event Details</h2>
        <p><strong>Event Type:</strong> ${data.eventType}</p>
        <p><strong>Event Date:</strong> ${data.eventDate}</p>
        <p><strong>Start Time:</strong> ${data.startTime}</p>
        <p><strong>End Time:</strong> ${data.endTime}</p>
        <p><strong>Venue Name:</strong> ${data.venueName}</p>
        <p><strong>Venue Address:</strong> ${data.venueAddress}</p>
        <hr>
        <h2>Message</h2>
        <p>${data.message || 'No message provided.'}</p>
      `,
    });

    // 2. (Optional but recommended) Send a confirmation email to the customer
    await resend.emails.send({
        from: 'The Magazine Photo Booth <onboarding@resend.dev>',
        to: data.email,
        subject: 'We received your quote request!',
        html: `
          <h1>Thanks for reaching out, ${data.name}!</h1>
          <p>We've received your request for a quote for your ${data.eventType} and will get back to you within 24 hours.</p>
          <p>Here's a summary of what we received:</p>
          <ul>
            <li><strong>Event Date:</strong> ${data.eventDate}</li>
            <li><strong>Timings:</strong> ${data.startTime} to ${data.endTime}</li>
            <li><strong>Venue:</strong> ${data.venueName}</li>
          </ul>
          <p>Talk soon,</p>
          <p>The Team at The Magazine Photo Booth</p>
        `,
    });

    return { success: true, data };

  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send email.' };
  }
}