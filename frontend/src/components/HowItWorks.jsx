import React from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiImage, FiDownloadCloud } from 'react-icons/fi';

const steps = [
  {
    step: "01",
    icon: <FiEdit3 className="text-3xl text-luxury-purple-light" />,
    title: "Fill Info",
    description: "Input student details like Name, Department, Year, Roll No, and an optional quote to personalize the greeting."
  },
  {
    step: "02",
    icon: <FiImage className="text-3xl text-luxury-blue-light" />,
    title: "Upload Photo",
    description: "Upload a high-quality portrait. Our image generator automatically crops and positions it inside the frame."
  },
  {
    step: "03",
    icon: <FiDownloadCloud className="text-3xl text-luxury-gold" />,
    title: "Download Posters",
    description: "Browse the three premium luxury designs (Purple, Blue, Black Gold) and download your favorite immediately."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden bg-black/20">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-xs font-bold tracking-widest text-luxury-blue-light uppercase mb-3">WORKFLOW</h2>
          <p className="text-3xl sm:text-5xl font-black tracking-tight">
            Three Steps to <span className="bg-clip-text text-transparent bg-gradient-to-r from-luxury-blue-light to-purple-400">Designer Posters</span>
          </p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-luxury-blue-light to-purple-400 mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connector Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-luxury-purple/30 via-luxury-blue/30 to-luxury-gold/30 -translate-y-12 z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Step bubble */}
              <div className="w-20 h-20 rounded-full glass-panel flex items-center justify-center border-2 border-white/10 group-hover:border-luxury-purple/50 transition-all duration-300 mb-8 relative shadow-xl">
                {step.icon}
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-slate-900 border border-white/20 text-xs font-bold flex items-center justify-center text-slate-300">
                  {step.step}
                </span>
              </div>

              <h3 className="text-2xl font-bold mb-3 text-slate-100">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
