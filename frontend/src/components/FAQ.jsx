import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';

const faqs = [
  {
    question: "Is SmartWish AI completely free?",
    answer: "Yes! SmartWish AI is 100% free. You can generate as many birthday posters as you want, with no watermarks, no limits, and absolutely no registration or credit card required."
  },
  {
    question: "What dimensions are the generated posters?",
    answer: "Each poster is exported at a high-resolution 1080x1350 pixel layout. This 4:5 aspect ratio is optimized for Instagram feeds, WhatsApp statuses, Facebook posts, and high-quality printing."
  },
  {
    question: "How does the auto-crop image framing work?",
    answer: "When you upload a portrait, our backend Sharp processing engine reads the dimensions, crops the image into a perfect square centering around the top-middle segment (where faces typically reside), and overlays it with smooth borders, glow effects, or glass cards to blend it into the design template."
  },
  {
    question: "Are my uploaded photos safe and secure?",
    answer: "Yes, your privacy is our top priority. Uploaded photos are stored in a temporary folder for less than a second, processed to compile the posters, and immediately deleted from the server. We do not store any photos permanently, nor do we require login or account sign-ups."
  },
  {
    question: "What file formats can I download?",
    answer: "Once your posters are generated, you can download each design individually in either high-quality PNG (lossless) or standard JPG format depending on your preference."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute left-10 bottom-10 w-[250px] h-[250px] bg-luxury-purple/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold tracking-widest text-luxury-purple-light uppercase mb-3">QUESTIONS</h2>
          <p className="text-3xl sm:text-5xl font-black tracking-tight">
            Frequently Asked <span className="bg-clip-text text-transparent bg-gradient-to-r from-luxury-purple-light to-luxury-gold">Questions</span>
          </p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-luxury-purple-light to-luxury-gold mx-auto mt-4 rounded-full" />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div 
                key={idx}
                className="glass-panel rounded-2xl overflow-hidden border border-white/5 hover:border-luxury-purple/20 transition-colors"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-6 sm:p-8 text-left font-bold text-lg text-slate-200 hover:text-slate-100 transition-colors"
                >
                  <span>{faq.question}</span>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-luxury-purple-light">
                    {isOpen ? <FiMinus /> : <FiPlus />}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-8 pb-8 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
