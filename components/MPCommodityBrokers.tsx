"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, Globe2, FileText, Fuel, CheckCircle2,
  ArrowRight, Mail, Phone, MapPin, AlertTriangle,
  BadgeCheck, LockKeyhole, ClipboardCheck, MessageCircle, Users,
  ChevronRight, ExternalLink, Loader
} from "lucide-react";

// --- Custom UI Components (Replacing missing Shadcn components) ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = "", variant = "primary", disabled = false, type = "button" }: any) => {
  const variants = {
    primary: "bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-lg shadow-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed",
    outline: "border border-white/20 bg-white/5 text-white hover:bg-white/10"
  };
  return (
    <button 
      type={type}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-bold transition-all active:scale-95 ${variants[variant as keyof typeof variants]} ${className}`}
    >
      {children}
    </button>
  );
};

interface FormData {
  fullName: string;
  email: string;
  product: string;
  quantity: string;
  message: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  product?: string;
  quantity?: string;
  message?: string;
}

export default function MPCommodityBrokers() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    product: "",
    quantity: "",
    message: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.product.trim()) {
      newErrors.product = "Product type is required";
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = "Please enter a valid quantity";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Message must be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch("/api/submit-enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit enquiry");
      }

      setSubmitStatus("success");
      setSubmitMessage("Enquiry submitted successfully! We'll review and contact you shortly.");
      setFormData({
        fullName: "",
        email: "",
        product: "",
        quantity: "",
        message: ""
      });
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(error instanceof Error ? error.message : "Failed to submit enquiry. Please try again.");
      
      // Reset status after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: <Fuel className="h-7 w-7" />,
      title: "Energy Facilitation",
      text: "Structured support for EN590 10ppm, Jet A1, D6, Crude Oil, and LNG."
    },
    {
      icon: <ClipboardCheck className="h-7 w-7" />,
      title: "Buyer Qualification",
      text: "Rigorous filtering by product, port, and proof of capability before introductions."
    },
    {
      icon: <FileText className="h-7 w-7" />,
      title: "Document Alignment",
      text: "Expert review of LOIs, ICPOs, and transaction procedures to ensure compliance."
    },
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: "Intermediary Safety",
      text: "Securing commission positions and NCNDA/IMFPA protocols for all parties."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 selection:bg-amber-400/30">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-md" role="navigation" aria-label="Main navigation">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 font-black text-slate-950 shadow-lg shadow-amber-400/20">MP</div>
            <span className="text-xl font-bold tracking-tight">MP Commodity <span className="text-amber-400">Brokers</span></span>
          </div>
          <div className="hidden gap-8 text-sm font-medium text-slate-400 md:flex">
            <a href="#services" className="transition-colors hover:text-amber-400">Services</a>
            <a href="#qualify" className="transition-colors hover:text-amber-400">Qualification</a>
            <a href="#contact" className="transition-colors hover:text-amber-400">Contact</a>
          </div>
          <Button className="hidden py-2.5 text-sm md:flex">Submit Enquiry</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20" aria-label="Hero section">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-amber-500/10 blur-[120px]" aria-hidden="true" />
          <div className="absolute top-[40%] -left-[10%] h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[120px]" aria-hidden="true" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/5 px-4 py-1.5 text-sm font-medium text-amber-300">
              <Globe2 className="h-4 w-4" /> Global Commodity Intelligence
            </div>
            <h1 className="mx-auto max-w-5xl text-5xl font-bold tracking-tight sm:text-7xl lg:leading-[1.1]">
              Professional Energy Trade <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent italic">Facilitation.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-400">
              Bridging the gap between qualified energy buyers and credible global sellers. We enforce discipline, documentation, and protection in every transaction.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button className="w-full sm:w-auto">Get Started <ArrowRight className="h-5 w-5" /></Button>
              <Button variant="outline" className="w-full sm:w-auto">
                <MessageCircle className="h-5 w-5" /> WhatsApp Review
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-white/5 bg-slate-950/50 backdrop-blur-sm" aria-label="Trust indicators">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Commodity Focus", val: "Energy" },
              { label: "Verification", val: "KYC/AML" },
              { label: "Protection", val: "NCNDA" },
              { label: "Market", val: "Global" }
            ].map((stat, i) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.val}</p>
                <p className="text-sm text-slate-500 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 lg:py-32" aria-label="Services section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold sm:text-5xl">Built for Credibility.</h2>
            <p className="mt-4 text-slate-400">Our core services ensure your trade moves from LOI to SPA safely.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.div key={i} whileHover={{ y: -10 }}>
                <Card className="h-full p-8 transition-colors hover:border-amber-400/30">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-400">
                    {s.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{s.text}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Red Flags / Quality Control */}
      <section className="bg-slate-900/40 py-24" aria-label="Quality control section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">We Filter the Noise.</h2>
              <p className="mt-6 text-slate-400">The energy sector is plagued by intermediaries who lack authority. MP Commodity Brokers protects your time by screening for:</p>
              
              <div className="mt-8 space-y-4">
                {[
                  "Incomplete trade history/corporate profiles",
                  "Unrealistic pricing below Platts market value",
                  "Refusal to provide proof of capability",
                  "Attempts to bypass protection protocols"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-300">
                    <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
               <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-3xl blur opacity-20" aria-hidden="true" />
               <Card className="relative bg-slate-950 p-8">
                  <BadgeCheck className="h-12 w-12 text-amber-400 mb-6" aria-hidden="true" />
                  <h3 className="text-2xl font-bold mb-4">Mandatory Intake</h3>
                  <div className="space-y-3">
                    {["LOI/ICPO Readiness", "Product & Quantity", "Port of Delivery", "Payment Instrument (SBLC/DLC)"].map((req, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" />
                        <span className="font-medium">{req}</span>
                      </div>
                    ))}
                  </div>
               </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-24" aria-label="Contact form section">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-[2.5rem] bg-gradient-to-b from-slate-900 to-slate-950 border border-white/5 p-8 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-4xl font-bold">Contact Facilitation.</h2>
                <p className="mt-6 text-slate-400">Submit your enquiry with full specifications. Only complete, professional requests will be reviewed.</p>
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-400/10 p-3 rounded-full text-amber-400"><Mail aria-hidden="true" /></div>
                    <span className="text-slate-300 font-medium">info@mpcommoditybrokers.com</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-amber-400/10 p-3 rounded-full text-amber-400"><MapPin aria-hidden="true" /></div>
                    <span className="text-slate-300 font-medium">Sydney, Australia • Global Network</span>
                  </div>
                </div>
              </div>

              <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
                {submitStatus !== "idle" && (
                  <div 
                    role="alert"
                    className={`p-4 rounded-xl ${submitStatus === "success" ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300" : "bg-red-500/10 border border-red-500/30 text-red-300"}`}
                  >
                    {submitMessage}
                  </div>
                )}

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input 
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? "fullName-error" : undefined}
                    className={`w-full rounded-xl border ${errors.fullName ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-white/5"} px-5 py-4 outline-none focus:border-amber-400 transition-colors`}
                    placeholder="Full Name"
                  />
                  {errors.fullName && (
                    <p id="fullName-error" className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Company Email
                  </label>
                  <input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`w-full rounded-xl border ${errors.email ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-white/5"} px-5 py-4 outline-none focus:border-amber-400 transition-colors`}
                    placeholder="Company Email"
                  />
                  {errors.email && (
                    <p id="email-error" className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="product" className="block text-sm font-medium text-slate-300 mb-2">
                      Product
                    </label>
                    <input 
                      id="product"
                      name="product"
                      type="text"
                      value={formData.product}
                      onChange={handleChange}
                      aria-invalid={!!errors.product}
                      aria-describedby={errors.product ? "product-error" : undefined}
                      className={`w-full rounded-xl border ${errors.product ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-white/5"} px-5 py-4 outline-none focus:border-amber-400 transition-colors`}
                      placeholder="Product (e.g. EN590)"
                    />
                    {errors.product && (
                      <p id="product-error" className="text-red-400 text-sm mt-1">{errors.product}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-slate-300 mb-2">
                      Quantity
                    </label>
                    <input 
                      id="quantity"
                      name="quantity"
                      type="text"
                      value={formData.quantity}
                      onChange={handleChange}
                      aria-invalid={!!errors.quantity}
                      aria-describedby={errors.quantity ? "quantity-error" : undefined}
                      className={`w-full rounded-xl border ${errors.quantity ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-white/5"} px-5 py-4 outline-none focus:border-amber-400 transition-colors`}
                      placeholder="Quantity"
                    />
                    {errors.quantity && (
                      <p id="quantity-error" className="text-red-400 text-sm mt-1">{errors.quantity}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Message / Procedure Overview
                  </label>
                  <textarea 
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`w-full h-32 rounded-xl border ${errors.message ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-white/5"} px-5 py-4 outline-none focus:border-amber-400 transition-colors resize-none`}
                    placeholder="Message / Procedure Overview"
                  />
                  {errors.message && (
                    <p id="message-error" className="text-red-400 text-sm mt-1">{errors.message}</p>
                  )}
                </div>

                <Button 
                  type="submit"
                  className="py-5"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>Submit Qualified Enquiry</>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12" role="contentinfo">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <p className="text-slate-500 text-sm">© 2026 MP Commodity Brokers. All rights reserved.</p>
          <p className="mt-4 text-xs text-slate-600 max-w-3xl mx-auto italic">
            Disclaimer: We are an intermediary facilitation service. We do not provide financial advice. All trades are subject to rigorous KYC/AML procedures and independent legal verification.
          </p>
        </div>
      </footer>
    </div>
  );
}