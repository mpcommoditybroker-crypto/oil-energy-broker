import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

// Types
interface SubmitEnquiryRequest {
  fullName: string;
  email: string;
  product: string;
  quantity: string;
  message: string;
}

interface ValidationError {
  field: string;
  message: string;
}

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, number[]>();

// Utility Functions
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string, maxRequests: number = 5, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  
  // Filter out timestamps older than the window
  const recentTimestamps = timestamps.filter(t => now - t < windowMs);
  
  if (recentTimestamps.length >= maxRequests) {
    return false;
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  rateLimitMap.set(ip, recentTimestamps);
  
  return true;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateForm(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.fullName?.trim()) {
    errors.push({ field: "fullName", message: "Full name is required" });
  } else if (data.fullName.trim().length < 2) {
    errors.push({ field: "fullName", message: "Name must be at least 2 characters" });
  }

  if (!data.email?.trim()) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Please enter a valid email address" });
  }

  if (!data.product?.trim()) {
    errors.push({ field: "product", message: "Product type is required" });
  }

  if (!data.quantity?.trim()) {
    errors.push({ field: "quantity", message: "Quantity is required" });
  } else if (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0) {
    errors.push({ field: "quantity", message: "Please enter a valid quantity" });
  }

  if (!data.message?.trim()) {
    errors.push({ field: "message", message: "Message is required" });
  } else if (data.message.trim().length < 20) {
    errors.push({ field: "message", message: "Message must be at least 20 characters" });
  }

  return errors;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function setupTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;

  if (!emailUser || !emailPassword) {
    throw new Error("Email credentials not configured in environment variables");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
}

async function sendEmails(data: SubmitEnquiryRequest): Promise<void> {
  const transporter = await setupTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || "info@mpcommoditybrokers.com";
  
  const escapedData = {
    fullName: escapeHtml(data.fullName),
    email: escapeHtml(data.email),
    product: escapeHtml(data.product),
    quantity: escapeHtml(data.quantity),
    message: escapeHtml(data.message),
  };

  // Admin notification email
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmail,
    subject: `New Enquiry: ${escapedData.product} - ${escapedData.quantity} units`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">New Commodity Enquiry Received</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Full Name:</strong> ${escapedData.fullName}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapedData.email}">${escapedData.email}</a></p>
          <p><strong>Product:</strong> ${escapedData.product}</p>
          <p><strong>Quantity:</strong> ${escapedData.quantity}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: #fff; padding: 10px; border-radius: 4px;">${escapedData.message}</p>
        </div>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          This is an automated message from MP Commodity Brokers enquiry system.
        </p>
      </div>
    `,
    text: `
New Commodity Enquiry Received

Full Name: ${escapedData.fullName}
Email: ${escapedData.email}
Product: ${escapedData.product}
Quantity: ${escapedData.quantity}

Message:
${escapedData.message}

---
This is an automated message from MP Commodity Brokers enquiry system.
    `,
  };

  // User confirmation email
  const userMailOptions = {
    from: process.env.EMAIL_USER,
    to: escapedData.email,
    subject: "Enquiry Received - MP Commodity Brokers",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Enquiry Received</h2>
        <p>Dear ${escapedData.fullName},</p>
        <p>Thank you for submitting your enquiry to MP Commodity Brokers. We have received your request for:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Product:</strong> ${escapedData.product}</p>
          <p><strong>Quantity:</strong> ${escapedData.quantity}</p>
        </div>
        <p>Our team will review your enquiry and contact you shortly to discuss the details and next steps.</p>
        <p>We appreciate your interest in MP Commodity Brokers and look forward to facilitating your trade.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Best regards,<br />
          <strong>MP Commodity Brokers</strong><br />
          Sydney, Australia • Global Network<br />
          <a href="mailto:info@mpcommoditybrokers.com">info@mpcommoditybrokers.com</a>
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 30px;" />
        <p style="color: #9ca3af; font-size: 11px;">
          This is an automated message. Please do not reply to this email. For support, contact info@mpcommoditybrokers.com
        </p>
      </div>
    `,
    text: `
Enquiry Received

Dear ${escapedData.fullName},

Thank you for submitting your enquiry to MP Commodity Brokers. We have received your request for:

Product: ${escapedData.product}
Quantity: ${escapedData.quantity}

Our team will review your enquiry and contact you shortly to discuss the details and next steps.

We appreciate your interest in MP Commodity Brokers and look forward to facilitating your trade.

Best regards,
MP Commodity Brokers
Sydney, Australia • Global Network
info@mpcommoditybrokers.com

---
This is an automated message. Please do not reply to this email.
    `,
  };

  // Send emails
  await Promise.all([
    transporter.sendMail(adminMailOptions),
    transporter.sendMail(userMailOptions),
  ]);
}

// Main POST handler
export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { message: "Too many requests. Maximum 5 enquiries per hour." },
        { status: 429 }
      );
    }

    // Parse request body
    const body: SubmitEnquiryRequest = await request.json();

    // Validate form data
    const validationErrors = validateForm(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Send emails
    await sendEmails(body);

    // Return success response
    return NextResponse.json(
      {
        message: "Enquiry submitted successfully! We'll review and contact you shortly.",
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Form submission error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Invalid request format" },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Email credentials")) {
      return NextResponse.json(
        { message: "Server configuration error. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Failed to submit enquiry. Please try again later." },
      { status: 500 }
    );
  }
}