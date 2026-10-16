import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { MessageSquare, Mail, Phone, MapPin, CheckCircle, Send, MessageCircle, Clock, Shield } from 'lucide-react';
import { ContactInquiry } from '../types';

export const Contact: React.FC = () => {
  const { submitInquiry, homepageSettings } = useData();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Concert Performance' as ContactInquiry['inquiryType'],
    eventDate: '',
    location: '',
    budget: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      submitInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        inquiryType: formData.inquiryType,
        eventDate: formData.eventDate || undefined,
        location: formData.location || undefined,
        budget: formData.budget || undefined,
        message: formData.message,
      });
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
            Official Management & Representation
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Booking & Business Inquiries
          </h1>
          <p className="text-sm text-zinc-400">
            For concert headlining, festival appearances, corporate galas, film playback singing, and media inquiries, contact Rasel Babu’s executive management.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Booking Form */}
          <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 sm:p-10 space-y-6">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-white">
                  Booking Inquiry Received
                </h3>
                <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out to Rasel Babu Management. Our executive team reviews all booking dates within 24–48 hours and will contact you via email or phone.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      inquiryType: 'Concert Performance',
                      eventDate: '',
                      location: '',
                      budget: '',
                      message: '',
                    });
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-display text-2xl font-bold text-white">
                  Request Event Performance or Collaboration
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Full Name / Organization <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangladesh Cultural Society"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Email Address <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="management@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Phone / WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+880 1711-XXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Concert Performance">Concert Performance (Live Arena / Stage)</option>
                      <option value="Corporate Event">Corporate Gala or Annual Program</option>
                      <option value="Playback Singing">Film / Telefilm Playback Vocalist</option>
                      <option value="Media & Interview">Press, Broadcast & Interview</option>
                      <option value="Other">Other Artistic Collaboration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Target Event Date
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Event City / Venue
                    </label>
                    <input
                      type="text"
                      placeholder="Dhaka, Chittagong, London..."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Estimated Budget (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BDT / USD budget range"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">
                    Event Details & Message <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide details regarding the audience size, program duration, acoustic setup, and requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-semibold text-xs tracking-wide transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitting Details...' : 'Submit Booking Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Direct WhatsApp, Management Contacts & Office */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct WhatsApp Callout */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 to-zinc-900 border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <MessageCircle className="w-6 h-6" />
                <h3 className="font-display text-xl font-bold text-white">
                  Fast-Track WhatsApp Booking
                </h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Need urgent date confirmation for an international concert or television shoot? Connect directly with the booking coordinator on WhatsApp.
              </p>
              <a
                href={`https://wa.me/88${(homepageSettings.bookingWhatsapp || homepageSettings.contactWhatsapp || '01723138736').replace(/\D/g, '').replace(/^88/, '')}?text=Hello%20Rasel%20Babu%20Management,%20I%20would%20like%20to%20inquire%20about%20booking%20for%20an%20event.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-emerald-500/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp Chat ({homepageSettings.bookingWhatsapp || homepageSettings.contactWhatsapp || '01723138736'})</span>
              </a>
            </div>

            {/* Official Management Credentials */}
            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 space-y-4 text-xs">
              <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Official Artist Representation
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Executive Inquiries</span>
                    <span className="text-zinc-200 font-medium">
                      {homepageSettings.bookingEmail || 'management@raselbabu.com'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Management Desk (Dhaka)</span>
                    <span className="text-zinc-200 font-medium">
                      {homepageSettings.bookingPhone || homepageSettings.contactPhone || '+880 1723-138736'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Artist Studio Base</span>
                    <span className="text-zinc-200 font-medium">
                      {homepageSettings.bookingAddress || 'Gulshan-2 / Banani, Dhaka, Bangladesh'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 block">Response Protocol</span>
                    <span className="text-zinc-200">
                      {homepageSettings.bookingResponseTime || 'Standard review: 24–48 hours for verified event proposals'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note on Authenticity */}
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center gap-3 text-xs text-zinc-400">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                {homepageSettings.bookingNotice || 'All performance contracts are legally executed directly through Rasel Babu Management.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
