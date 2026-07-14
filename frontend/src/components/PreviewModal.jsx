import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiCheck, FiRefreshCw } from 'react-icons/fi';

export default function PreviewModal({ isOpen, imageUrl, theme, onClose }) {
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  if (!isOpen) return null;

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    try {
      if (format === 'png') {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `smartwish-${theme.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        // High-res JPEG conversion via Canvas
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1080;
          canvas.height = 1350;
          const ctx = canvas.getContext('2d');
          
          // Draw solid background (JPEG doesn't support alpha transparency)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 1080, 1350);
          ctx.drawImage(img, 0, 0, 1080, 1350);
          
          const jpegUrl = canvas.toDataURL('image/jpeg', 0.95);
          const link = document.createElement('a');
          link.href = jpegUrl;
          link.download = `smartwish-${theme.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        img.src = imageUrl;
      }
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback
      window.open(imageUrl, '_blank');
    } finally {
      setTimeout(() => setDownloadingFormat(null), 1000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-lg w-full glass-panel rounded-3xl border border-white/10 p-6 flex flex-col gap-6 z-10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-luxury-purple-light tracking-widest uppercase">PREVIEW SUITE</span>
              <h4 className="text-xl font-extrabold text-white">{theme} Poster</h4>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* High-res Image container */}
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden shadow-lg border border-white/5 bg-slate-950 flex items-center justify-center">
            <img 
              src={imageUrl} 
              alt={`${theme} Birthday Poster`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Download & Controls */}
          <div className="grid grid-cols-2 gap-4">
            {/* PNG Download */}
            <button
              onClick={() => handleDownload('png')}
              disabled={downloadingFormat !== null}
              className="px-5 py-3.5 rounded-xl font-bold bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 flex items-center justify-center gap-2 transition-all hover:scale-102"
            >
              {downloadingFormat === 'png' ? (
                <>
                  <FiCheck className="text-emerald-400 animate-bounce" />
                  Downloaded
                </>
              ) : (
                <>
                  <FiDownload className="text-slate-400" />
                  Download PNG
                </>
              )}
            </button>

            {/* JPG Download */}
            <button
              onClick={() => handleDownload('jpg')}
              disabled={downloadingFormat !== null}
              className="px-5 py-3.5 rounded-xl font-bold btn-primary flex items-center justify-center gap-2 transition-all hover:scale-102"
            >
              {downloadingFormat === 'jpg' ? (
                <>
                  <FiCheck className="text-white animate-bounce" />
                  Downloaded
                </>
              ) : (
                <>
                  <FiDownload />
                  Download JPG
                </>
              )}
            </button>
          </div>

          {/* Additional details */}
          <div className="text-center text-[10px] text-slate-500 tracking-wide uppercase">
            Image size: 1080 x 1350 px • Instagram Post Resolution
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
