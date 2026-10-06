"use client";

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { CreditCard } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  studentId: string;
  onSuccess: () => void;
}

const CLASSES = [
  { id: 'JSS1', name: 'JSS 1', fee: 100000 },
  { id: 'JSS2', name: 'JSS 2', fee: 100000 },
  { id: 'JSS3', name: 'JSS 3', fee: 120000 },
  { id: 'SSS1', name: 'SSS 1 / Grade 10', fee: 150000 },
  { id: 'SSS2', name: 'SSS 2 / Grade 11', fee: 150000 },
  { id: 'SSS3', name: 'SSS 3 / Grade 12', fee: 180000 },
];

const FEE_TYPES = [
  { id: 'tuition', name: 'Tuition / School Fee', isFixedByClass: true },
  { id: 'excursion', name: 'Excursion Fee', fixedAmount: 20000 },
  { id: 'pta', name: 'PTA Levy', fixedAmount: 5000 },
  { id: 'uniform', name: 'School Uniform', fixedAmount: 15000 },
  { id: 'books', name: 'Textbooks', fixedAmount: 35000 },
  { id: 'custom', name: 'Other (Custom Amount)', fixedAmount: null },
];

export default function CustomPaymentModal({ isOpen, onClose, email, studentId, onSuccess }: Props) {
  const [classLevel, setClassLevel] = useState<string>('');
  const [feeType, setFeeType] = useState<string>('tuition');
  const [academicTerm, setAcademicTerm] = useState<string>('First Term');
  const [isInstallment, setIsInstallment] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');

  // Automatically compute amount based on selection
  useEffect(() => {
    const selectedFee = FEE_TYPES.find(f => f.id === feeType);
    if (!selectedFee) return;

    if (isInstallment && selectedFee.id === 'tuition') {
      // Don't auto-override if they are typing an installment
      return;
    }

    if (selectedFee.isFixedByClass) {
      if (classLevel) {
        const cls = CLASSES.find(c => c.id === classLevel);
        if (cls) setAmount(cls.fee.toString());
      } else {
        setAmount('');
      }
    } else if (selectedFee.fixedAmount !== null && selectedFee.fixedAmount !== undefined) {
      setAmount(selectedFee.fixedAmount.toString());
    } else {
      // For custom, leave whatever is there or clear it
      if (amount !== '' && FEE_TYPES.find(f => f.fixedAmount === parseFloat(amount) || CLASSES.find(c => c.fee === parseFloat(amount)))) {
        setAmount('');
      }
    }
  }, [feeType, classLevel, isInstallment]);

  const numericAmount = parseFloat(amount);
  const selectedFee = FEE_TYPES.find(f => f.id === feeType);
  const isCustomFee = selectedFee?.id === 'custom';
  
  let baseDescription = selectedFee?.name || 'School Payment';
  if (selectedFee?.id === 'tuition') {
    baseDescription = `${baseDescription} - ${academicTerm}`;
    if (isInstallment) baseDescription += ' (Part Payment)';
  }

  const finalDescription = isCustomFee 
    ? (customDescription.trim() || 'Custom Payment') 
    : baseDescription;

  const isValid = !isNaN(numericAmount) && numericAmount > 0 && classLevel !== '';

  const config = {
    reference: `fee_${studentId.slice(0, 8)}_${new Date().getTime()}`,
    email,
    amount: numericAmount * 100, // Paystack uses Kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
    metadata: {
      custom_fields: [
        { display_name: "Payment Type", variable_name: "payment_type", value: finalDescription },
        { display_name: "Class/Level", variable_name: "class_level", value: CLASSES.find(c => c.id === classLevel)?.name || classLevel }
      ],
      student_id: studentId,
      description: finalDescription,
      class_level: classLevel
    }
  };

  const initializePayment = usePaystackPayment(isValid ? config : { ...config, amount: 0 });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay Fees">
      <div className="p-6 space-y-5">
        <p className="text-sm text-slate-500">
          Select your class and what you are paying for.
        </p>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Class / Level</label>
          <select 
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            <option value="" disabled>Select your class</option>
            {CLASSES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Payment For</label>
          <select 
            value={feeType}
            onChange={(e) => {
              setFeeType(e.target.value);
              if (e.target.value !== 'tuition') setIsInstallment(false);
            }}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          >
            {FEE_TYPES.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {feeType === 'tuition' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Academic Term</label>
              <select 
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
            <div className="flex items-end pb-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold text-slate-700">Part Payment</span>
              </label>
            </div>
          </div>
        )}

        {isCustomFee && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description / Reason</label>
            <input 
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Extra Classes, Damages"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isCustomFee && !isInstallment}
              className={`w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${(!isCustomFee && !isInstallment) ? 'opacity-80 bg-slate-100' : ''}`}
              placeholder="0.00"
              min="100"
            />
          </div>
          {(!isCustomFee && !isInstallment) && <p className="text-xs text-blue-600 font-medium mt-2">Amount is fixed automatically.</p>}
          {isInstallment && <p className="text-xs text-amber-600 font-medium mt-2">Enter the part payment amount.</p>}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            disabled={!isValid}
            onClick={() => {
              initializePayment({
                onSuccess: () => {
                  onSuccess();
                  onClose();
                },
                onClose: () => {
                  console.log("Payment closed");
                }
              });
            }}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #09090b, #27272a)' }}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay ₦{isValid ? numericAmount.toLocaleString() : '0'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
