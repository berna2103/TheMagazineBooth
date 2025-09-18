'use server'; // This directive marks all functions in this file as Server Actions
import { Resend } from 'resend';
// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);
const recipientEmail = process.env.QUOTE_RECIPIENT_EMAIL;

// The core server action function
export async function sendQuoteRequest(data) {
  if (!recipientEmail) {
    console.error("Recipient email is not configured.");
    return { success: false, error: "Server configuration error." };
  }

  // Define the HTML for the confirmation email
  const confirmationHtml = `
    <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <h1 style="color: #333333; font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 20px;">Hi ${data.name}!</h1>
        <p style="color: #555555; font-size: 16px; line-height: 1.6;">Thank you for your interest in The Magazine Photo Booth! We've prepared a quote for your upcoming event.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
        <h2 style="color: #666666; font-size: 20px; text-align: center; margin-bottom: 20px;">Your Quote Summary</h2>
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
            <span style="color: #777777; font-size: 16px;">Base Rental Fee</span>
            <span style="color: #333333; font-weight: bold;">$${data.quote.basePrice.toFixed(2)}</span>
          </div>
          ${data.quote.extraHours > 0 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
            <span style="color: #777777; font-size: 16px;">Extra Hours (${data.quote.extraHours} hrs)</span>
            <span style="color: #333333; font-weight: bold;">$${data.quote.extraHoursCost.toFixed(2)}</span>
          </div>` : ''}
          ${data.quote.travelFee > 0 ? `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
            <span style="color: #777777; font-size: 16px;">Travel Fee</span>
            <span style="color: #333333; font-weight: bold;">$${data.quote.travelFee.toFixed(2)}</span>
          </div>` : ''}
          <div style="border-top: 2px solid #eeeeee; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 22px; font-weight: bold; color: #333333;">
            <span>Total Quote</span>
            <span style="color: #ff69b4;">$${data.quote.total.toFixed(2)}</span>
          </div>
        </div>
        <p style="color: #999999; font-size: 12px; text-align: center; margin-top: 20px; font-style: italic;">* This is an estimate based on the information provided. A final quote will be confirmed upon booking.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
        <p style="color: #555555; font-size: 16px; line-height: 1.6;">We'll be in touch within 24 hours to confirm the details and finalize your booking. We look forward to making your event special!</p>
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-top: 20px;">Best regards,<br>The Magazine Photo Booth Team</p>
      </div>
    </div>
  `;

  try {
    // 1. Send the notification email to yourself (the business owner)
    await resend.emails.send({
      from: 'The Magazine Photo Booth <sales@getfastreports.com>', // Use a verified domain
      to: 'bernardojimenezz@gmail.com',
      subject: `New Photo Booth Quote Request - ${data.eventType}`, // Corrected syntax
      reply_to: data.email,
      // You can either keep the existing simple HTML, or use a new one with the full details.
      // Here's an example of a simple but effective one for yourself:
      html: `
        <h1>New Photo Booth Quote Request</h1>
        <p>You have a new quote request from ${data.name} for a ${data.eventType} event on ${data.eventDate}.</p>
        <h2>Contact Details</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
        <h2>Event Details</h2>
        <p><strong>Event Type:</strong> ${data.eventType}</p>
        <p><strong>Event Date:</strong> ${data.eventDate}</p>
        <p><strong>Time:</strong> ${data.startTime} - ${data.endTime}</p>
        <p><strong>Venue:</strong> ${data.venueName}, ${data.venueAddress}</p>
        <h2>Quote Summary</h2>
        <p><strong>Base Price:</strong> $${data.quote.basePrice.toFixed(2)}</p>
        <p><strong>Extra Hours:</strong> ${data.quote.extraHours} ($${data.quote.extraHoursCost.toFixed(2)})</p>
        <p><strong>Travel Fee:</strong> $${data.quote.travelFee.toFixed(2)}</p>
        <p><strong>Total Quote:</strong> $${data.quote.total.toFixed(2)}</p>
        <h2>Customer Message</h2>
        <p>${data.message || 'No message provided.'}</p>
      `,
    });

    // 2. Send a styled confirmation email to the customer
    await resend.emails.send({
      from: 'The Magazine Photo Booth <sales@getfastreports.com>',
      to: data.email,
      subject: 'Your Magazine Booth Quote!',
      html: confirmationHtml,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send email.' };
  }
}