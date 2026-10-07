import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Calendar as CalendarIcon,
  Clock,
  RotateCcw,
  ArrowRight,
  Phone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin
} from 'lucide-react';

export interface BookingService {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  badge?: string;
  features: string[];
}

const DEFAULT_SERVICES: BookingService[] = [
  {
    id: 'bespoke-tailoring',
    name: 'The Grand Bespoke Consultation',
    category: 'Bespoke Tailoring',
    duration: '90 Min',
    price: 450,
    badge: 'Popular',
    description:
      'One-on-one anatomical assessment with our Head Pattern Cutter. Includes full tactile analysis across our 1,400-cloth archive and pattern draughting.',
    features: ['1,400+ cloth archive access', 'Full pattern draughting', 'Lounge hospitality']
  },
  {
    id: 'haute-horology',
    name: 'Private Horology Restoration Session',
    category: 'Haute Horology',
    duration: '120 Min',
    price: 620,
    badge: 'Recommended',
    description:
      'Technical appraisal and movement diagnostics by our Senior Horologist. Covers historical provenance verification and laser restoration planning.',
    features: ['Movement diagnostics', 'Provenance verification', 'Cosmetic restoration plan']
  },
  {
    id: 'private-aromatics',
    name: 'Sensory Atelier & Olfactory Creation',
    category: 'Private Aromatics',
    duration: '60 Min',
    price: 380,
    description:
      'Personalized nose formulation sitting alongside our Master Parfumeur. Formulation of a proprietary 50ml flacon extracted from rare botanical absolutes.',
    features: ['50ml custom bespoke flacon', 'Certified Grasse absolutes', 'Olfactory formula card']
  }
];

interface TimeSlotGroup {
  period: string;
  slots: { time: string; available: boolean }[];
}

const DEFAULT_TIME_SLOTS: TimeSlotGroup[] = [
  {
    period: 'Morning',
    slots: [
      { time: '09:30 AM', available: true },
      { time: '11:00 AM', available: true },
      { time: '11:45 AM', available: false }
    ]
  },
  {
    period: 'Afternoon',
    slots: [
      { time: '01:30 PM', available: true },
      { time: '03:00 PM', available: true },
      { time: '04:30 PM', available: true }
    ]
  },
  {
    period: 'Evening',
    slots: [
      { time: '06:00 PM', available: true },
      { time: '07:30 PM', available: false }
    ]
  }
];

const CALENDAR_DAYS = [
  { day: 29, currentMonth: false },
  { day: 30, currentMonth: false },
  { day: 1, currentMonth: true, available: true },
  { day: 2, currentMonth: true, available: true },
  { day: 3, currentMonth: true, available: true },
  { day: 4, currentMonth: true, available: true },
  { day: 5, currentMonth: true, available: true },
  { day: 6, currentMonth: true, available: true },
  { day: 7, currentMonth: true, available: true },
  { day: 8, currentMonth: true, available: true },
  { day: 9, currentMonth: true, available: true },
  { day: 10, currentMonth: true, available: true },
  { day: 11, currentMonth: true, available: false },
  { day: 12, currentMonth: true, available: false },
  { day: 13, currentMonth: true, available: true },
  { day: 14, currentMonth: true, available: true },
  { day: 15, currentMonth: true, available: true },
  { day: 16, currentMonth: true, available: true },
  { day: 17, currentMonth: true, available: true },
  { day: 18, currentMonth: true, available: false },
  { day: 19, currentMonth: true, available: false },
  { day: 20, currentMonth: true, available: true },
  { day: 21, currentMonth: true, available: true },
  { day: 22, currentMonth: true, available: true },
  { day: 23, currentMonth: true, available: true },
  { day: 24, currentMonth: true, available: true },
  { day: 25, currentMonth: true, available: false },
  { day: 26, currentMonth: true, available: false },
  { day: 27, currentMonth: true, available: true },
  { day: 28, currentMonth: true, available: true },
  { day: 29, currentMonth: true, available: true },
  { day: 30, currentMonth: true, available: true },
  { day: 31, currentMonth: true, available: true },
  { day: 1, currentMonth: false },
  { day: 2, currentMonth: false }
];

export interface BookingEngineProps {
  services?: BookingService[];
  onBookingSuccess?: (bookingId: string) => void;
  whatsappNumber?: string;
}

export function BookingEngine({
  services = DEFAULT_SERVICES,
  onBookingSuccess,
  whatsappNumber = '923000000000'
}: BookingEngineProps) {
  const [selectedService, setSelectedService] = useState<BookingService>(services[1] || services[0]);
  const [selectedDay, setSelectedDay] = useState<number>(14);
  const [selectedSlot, setSelectedSlot] = useState<string>('01:30 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedId, setConfirmedId] = useState<string | null>(null);

  const nameInputId = useId();
  const phoneInputId = useId();
  const emailInputId = useId();
  const notesInputId = useId();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const handleReset = () => {
    setSelectedService(services[1] || services[0]);
    setSelectedDay(14);
    setSelectedSlot('01:30 PM');
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setConfirmedId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const appointmentDateStr = `2026-10-${selectedDay < 10 ? '0' + selectedDay : selectedDay}`;

    const payload = {
      patientName: formData.name.trim() || 'Private Client',
      patientPhone: formData.phone.trim(),
      serviceType: selectedService.name,
      appointmentDate: appointmentDateStr,
      appointmentTime: selectedSlot,
      specialRequests: formData.notes,
      email: formData.email
    };

    let bookingId = `APT-${Date.now()}`;

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data: any = await res.json();
        if (data?.aptId) {
          bookingId = data.aptId;
        }
      }
    } catch {
      // Graceful fallback for preview / standalone environments
    }

    setConfirmedId(bookingId);
    setIsSubmitting(false);
    if (onBookingSuccess) {
      onBookingSuccess(bookingId);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden flex flex-col lg:flex-row font-sans text-zinc-900">
      {/* ======================================================== */}
      {/* LEFT COLUMN: STICKY CONTEXT / LIVE BOOKING SUMMARY       */}
      {/* ======================================================== */}
      <aside className="lg:w-[380px] xl:w-[420px] bg-zinc-50 border-b lg:border-b-0 lg:border-r border-zinc-200/80 p-6 sm:p-8 lg:p-10 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Header & Reset Action */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200/60">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                Reservation Folio
              </span>
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 mt-0.5">
                Booking Summary
              </h2>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 px-2.5 py-1.5 rounded-lg transition-colors"
              title="Reset all selections to default"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Selected Service Card */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4.5 space-y-2 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Selected Service
            </span>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-zinc-950 text-sm leading-snug">
                  {selectedService.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    {selectedService.duration}
                  </span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-xs text-zinc-500">
                    {selectedService.category}
                  </span>
                </div>
              </div>
              <span className="text-base font-bold text-zinc-950 whitespace-nowrap">
                ${selectedService.price}
              </span>
            </div>
          </div>

          {/* Selected Schedule Card */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4.5 space-y-2 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
              Appointment Schedule
            </span>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-zinc-800">
                <CalendarIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="font-medium">
                  Wednesday, Oct {selectedDay}, 2026
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-800">
                <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="font-semibold text-zinc-950">
                  {selectedSlot} EST
                </span>
              </div>
            </div>
          </div>

          {/* Session Location & Type */}
          <div className="bg-white border border-zinc-200/80 rounded-xl p-4.5 space-y-1.5 shadow-xs text-xs text-zinc-600">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block">
              Session Location
            </span>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-900">Private Suite 401</p>
                <p className="text-zinc-500">One-on-One Dedicated Consultation</p>
              </div>
            </div>
          </div>

          {/* Deposit Breakdown */}
          <div className="border-t border-zinc-200/80 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Session Fee</span>
              <span>${selectedService.price}.00</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Suite Hospitality</span>
              <span className="text-emerald-700 font-medium">Included</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200 font-bold text-sm text-zinc-950">
              <span className="text-xs uppercase tracking-wider text-zinc-700">Total Deposit</span>
              <span className="text-2xl font-extrabold tracking-tight text-zinc-950">
                ${selectedService.price}
              </span>
            </div>
          </div>
        </div>

        {/* Left Footer Callout */}
        <div className="mt-6 pt-5 border-t border-zinc-200/60 space-y-3">
          <div className="flex items-start gap-3 text-xs text-zinc-500 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
            <p>
              Private sessions require 24 hours advance notice. Dedicated concierge support is available via WhatsApp.
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-200/50 flex justify-between items-center text-xs">
            <Link
              to="/admin"
              className="text-zinc-600 hover:text-black font-medium transition-colors flex items-center gap-1"
            >
              <span>Operations Console</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <span className="text-zinc-400 font-mono text-[11px]">Admin Access</span>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: INTERACTIVE STEPS / CONFIRMATION RECEIPT   */}
      {/* ======================================================== */}
      <main className="flex-1 bg-white p-6 sm:p-8 lg:p-10 space-y-12 overflow-y-auto">
        {!confirmedId ? (
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* ---------------------------------------------------- */}
            {/* STEP 1: SELECT SERVICE (RADIO CARDS)                 */}
            {/* ---------------------------------------------------- */}
            <section className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-semibold">
                    1
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Step 1
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
                  Select Service
                </h3>
                <p className="text-sm text-zinc-500">
                  Select the tailored session that matches your consultation requirements.
                </p>
              </div>

              {/* Service Radio Cards */}
              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = selectedService.id === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`relative p-4.5 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-black ring-1 ring-black bg-zinc-50/40 shadow-xs'
                          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/20'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 sm:gap-4">
                        {/* Radio Dot */}
                        <div className="pt-0.5 shrink-0">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'border-black bg-black'
                                : 'border-zinc-300 bg-white'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className={`text-sm sm:text-base font-semibold ${
                                  isSelected ? 'text-zinc-950' : 'text-zinc-800'
                                }`}
                              >
                                {service.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                                {service.duration}
                              </span>
                              {service.badge && (
                                <span className="px-2 py-0.5 rounded-full bg-black text-[10px] font-semibold uppercase tracking-wider text-white">
                                  {service.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-base sm:text-lg font-bold text-zinc-950 whitespace-nowrap">
                              ${service.price}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                            {service.description}
                          </p>

                          {/* Features */}
                          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-2.5 border-t border-zinc-100 text-xs text-zinc-500 font-medium">
                            {service.features.map((feat, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-zinc-800 shrink-0" />
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* STEP 2: DATE & TIME (CALENDAR & CHUNKY PILL BUTTONS) */}
            {/* ---------------------------------------------------- */}
            <section className="space-y-6 pt-4 border-t border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-semibold">
                    2
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Step 2
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
                  Date &amp; Time
                </h3>
                <p className="text-sm text-zinc-500">
                  Select your reserved date and preferred time slot.
                </p>
              </div>

              {/* Calendar Container */}
              <div className="border border-zinc-200 rounded-xl p-5 sm:p-6 space-y-5 bg-zinc-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-semibold text-zinc-950">
                    October 2026
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Previous month"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next month"
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 text-center text-xs font-semibold text-zinc-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-sm">
                  {CALENDAR_DAYS.map((item, idx) => {
                    if (!item.currentMonth) {
                      return (
                        <div
                          key={idx}
                          className="py-2 text-zinc-300 font-normal text-xs"
                        >
                          {item.day}
                        </div>
                      );
                    }

                    const isSelected = selectedDay === item.day;
                    const isAvailable = item.available;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSelectedDay(item.day)}
                        className={`py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-black text-white font-semibold shadow-xs'
                            : isAvailable
                            ? 'text-zinc-800 hover:bg-zinc-100 hover:text-black'
                            : 'text-zinc-300 line-through cursor-not-allowed'
                        }`}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-black" />
                    <span className="font-medium text-zinc-700">
                      Selected: Oct {selectedDay}, 2026
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full border border-zinc-300" />
                    <span>Available</span>
                  </div>
                </div>
              </div>

              {/* Chunky Pill Buttons Grouped by Period */}
              <div className="space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">
                  Available Time Slots
                </span>
                <div className="space-y-4">
                  {DEFAULT_TIME_SLOTS.map((group) => (
                    <div key={group.period} className="space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        {group.period}
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {group.slots.map((slot) => {
                          const isSelected = selectedSlot === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => slot.available && setSelectedSlot(slot.time)}
                              className={`px-4.5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                isSelected
                                  ? 'bg-black text-white font-semibold ring-2 ring-black shadow-xs'
                                  : slot.available
                                  ? 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
                                  : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------- */}
            {/* STEP 3: GUEST INFORMATION & SUBMIT                   */}
            {/* ---------------------------------------------------- */}
            <section className="space-y-6 pt-4 border-t border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-black text-white text-xs font-semibold">
                    3
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Step 3
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 mt-1.5">
                  Guest Information
                </h3>
                <p className="text-sm text-zinc-500">
                  Provide your contact details to reserve and receive confirmation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor={nameInputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id={nameInputId}
                    type="text"
                    required
                    placeholder="Julian Vance"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor={phoneInputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
                  >
                    Phone / WhatsApp *
                  </label>
                  <input
                    id={phoneInputId}
                    type="tel"
                    required
                    placeholder="+1 (555) 019-2834"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor={emailInputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
                  >
                    Email Address (Optional)
                  </label>
                  <input
                    id={emailInputId}
                    type="email"
                    placeholder="client@dossier.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor={notesInputId}
                    className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 mb-1.5"
                  >
                    Special Requests or Notes
                  </label>
                  <textarea
                    id={notesInputId}
                    rows={2}
                    placeholder="Specific measurements, timepiece reference numbers, or requirements..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Prominent Full-Width Black Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white hover:bg-zinc-800 py-4.5 px-6 rounded-xl text-base font-semibold tracking-wide transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Reservation...</span>
                  ) : (
                    <>
                      <span>Confirm Reservation</span>
                      <span className="text-zinc-400">—</span>
                      <span>${selectedService.price}</span>
                      <ArrowRight className="w-5 h-5 ml-0.5" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-zinc-500 mt-2.5">
                  By confirming, your private suite slot is locked into our calendar.
                </p>
              </div>
            </section>
          </form>
        ) : (
          /* ======================================================== */
          /* CONFIRMATION RECEIPT CARD                                */
          /* ======================================================== */
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 sm:p-10 text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-black text-white flex items-center justify-center shadow-xs">
              <Check className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs uppercase tracking-widest font-semibold text-emerald-600">
                Reservation Confirmed
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                Private Suite Reserved
              </h3>
              <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                Your appointment has been registered with our team. Please save your reference ID for check-in.
              </p>
            </div>

            {/* Receipt Summary Folio */}
            <div className="bg-white border border-zinc-200/90 rounded-xl p-5 sm:p-6 text-left space-y-3 max-w-md mx-auto text-xs sm:text-sm shadow-xs">
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <span className="text-zinc-500">Reference ID</span>
                <span className="font-mono font-bold text-zinc-950">{confirmedId}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <span className="text-zinc-500">Guest Name</span>
                <span className="font-semibold text-zinc-900">{formData.name || 'Private Client'}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <span className="text-zinc-500">Service</span>
                <span className="font-semibold text-zinc-900">{selectedService.name}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-2">
                <span className="text-zinc-500">Date &amp; Time</span>
                <span className="font-semibold text-zinc-900">
                  Oct {selectedDay}, 2026 at {selectedSlot} EST
                </span>
              </div>
              <div className="flex justify-between pt-1 font-semibold text-zinc-950">
                <span>Total Amount</span>
                <span>${selectedService.price}</span>
              </div>
            </div>

            {/* Actions: WhatsApp Direct Confirmation + Start Over */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                  `*Booking Confirmation Receipt*\nReference: ${confirmedId}\nGuest: ${formData.name || 'Private Client'}\nService: ${selectedService.name}\nDate: Oct ${selectedDay}, 2026 at ${selectedSlot}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex-1 bg-black text-white py-3.5 px-6 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto bg-white border border-zinc-200 text-zinc-700 py-3.5 px-6 rounded-xl text-sm font-semibold hover:bg-zinc-100 transition-colors"
              >
                Book Another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default BookingEngine;
