import React, { useState } from 'react';
import { X, LoaderCircle } from 'lucide-react';
import { clientConfig } from '../config/client';
import type { CartItem } from '../lib/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onComplete?: () => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  items,
  total,
  onComplete,
}: CheckoutModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let orderId = `ORD-${Date.now()}`;

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: address,
          items,
          total,
        }),
      });

      if (res.ok) {
        try {
          const text = await res.text();
          if (text) {
            const data = JSON.parse(text);
            if (data?.orderId) {
              orderId = data.orderId;
            }
          }
        } catch {
          // Gracefully handle non-JSON responses
        }
      }
    } catch (err) {
      console.warn('Order API offline or pending, proceeding to WhatsApp:', err);
    } finally {
      const msg = `Order ID: ${orderId}\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nTotal: ${clientConfig.currencySymbol || 'Rs.'}${total}`;
      const cleanPhone = (clientConfig.whatsappNumber || '').replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
      if (onComplete) onComplete();
      if (onClose) onClose();
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center font-bold">
          <h2 className="text-lg">Checkout</h2>
          <button
            onClick={onClose}
            type="button"
            className="hover:bg-blue-700 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-4 space-y-3">
          <input
            required
            placeholder="Name"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            required
            placeholder="WhatsApp Number"
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <textarea
            required
            placeholder="Address"
            rows={3}
            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg flex justify-center items-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
          >
            {loading ? <LoaderCircle className="animate-spin w-5 h-5" /> : 'Order on WhatsApp'}
          </button>
        </form>
      </div>
    </div>
  );
}
