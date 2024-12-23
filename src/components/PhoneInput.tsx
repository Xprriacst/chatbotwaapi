import React, { useState } from 'react';
import { Phone } from 'lucide-react';

interface PhoneInputProps {
  onPhoneSubmit: (phone: string) => void;
}

export function PhoneInput({ onPhoneSubmit }: PhoneInputProps) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) {
      onPhoneSubmit(phone);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Numéro WhatsApp (ex: +33612345678)"
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
      >
        Connecter
      </button>
    </form>
  );
}