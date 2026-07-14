import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  FiUser, FiBookOpen, FiBookmark, FiCalendar, FiMessageSquare, 
  FiUploadCloud, FiStar, FiEye, FiDownload, FiCheck, FiAlertCircle 
} from 'react-icons/fi';
import { generatePostersApi } from '../services/api';
import confetti from 'canvas-confetti';

export default function Generator({ onOpenPreview }) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '1st',
    rollNo: '',
    birthdayQuote: ''
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Stores generated poster URLs
  const [posters, setPosters] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (PNG, JPG, JPEG, WEBP).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB.');
        return;
      }
      setPhoto(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
      }
      setPhoto(file);
      setError('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!formData.name.trim()) return setError('Student Name is required.');
    if (!formData.department.trim()) return setError('Department is required.');
    if (!formData.rollNo.trim()) return setError('Roll Number is required.');
    if (!photo) return setError('Please upload a student portrait photo.');

    setLoading(true);
    try {
      const data = await generatePostersApi(formData, photo);
      if (data.success && data.posters) {
        setPosters(data.posters);
        
        // Premium celebratory confetti explosion
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#7b2cbf', '#00f0ff', '#d4af37', '#ff70a6']
        });
      } else {
        setError('Generation failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger download directly from front-end
  const downloadPoster = async (url, themeName) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `smartwish-${themeName}-${formData.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback
      window.open(url, '_blank');
    }
  };

  return (
    <section id="generator" className="py-20 relative max-w-7xl mx-auto px-6 z-10 scroll-mt-20">
      <div className="text-center mb-16">
        <h2 className="text-xs font-bold tracking-widest text-luxury-purple-light uppercase mb-3">CREATIVE ENGINE</h2>
        <p className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          Create <span className="bg-clip-text text-transparent bg-gradient-to-r from-luxury-purple-light via-luxury-blue-light to-luxury-gold glow-purple">Poster Suite</span>
        </p>
        <div className="h-1.5 w-24 bg-gradient-to-r from-luxury-purple-light via-luxury-blue-light to-luxury-gold mx-auto mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col gap-6"
        >
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FiStar className="text-luxury-purple-light animate-spin" style={{ animationDuration: '4s' }} />
              Student Details
            </h3>
            <p className="text-slate-400 text-xs mt-1">Provide information to generate customized high-resolution posters.</p>
          </div>

          <form onSubmit={handleGenerate} className="flex flex-col gap-5">
            
            {/* Student Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FiUser className="text-purple-400" /> Student Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Samantha Smith"
                className="glass-input px-4 py-3 rounded-xl text-sm"
                required
              />
            </div>

            {/* Department & Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FiBookOpen className="text-blue-400" /> Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  className="glass-input px-4 py-3 rounded-xl text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <FiCalendar className="text-yellow-400" /> Academic Year
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="glass-input px-4 py-3 rounded-xl text-sm cursor-pointer"
                >
                  <option value="1st" className="bg-slate-900">1st Year</option>
                  <option value="2nd" className="bg-slate-900">2nd Year</option>
                  <option value="3rd" className="bg-slate-900">3rd Year</option>
                  <option value="4th" className="bg-slate-900">4th Year</option>
                  <option value="5th" className="bg-slate-900">5th Year</option>
                </select>
              </div>
            </div>

            {/* Roll Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FiBookmark className="text-pink-400" /> Roll Number
              </label>
              <input
                type="text"
                name="rollNo"
                value={formData.rollNo}
                onChange={handleInputChange}
                placeholder="e.g. CS2026042"
                className="glass-input px-4 py-3 rounded-xl text-sm"
                required
              />
            </div>

            {/* Custom Quote (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <FiMessageSquare className="text-emerald-400" /> Birthday Quote <span className="text-slate-500 font-normal lowercase">(optional)</span>
              </label>
              <textarea
                name="birthdayQuote"
                value={formData.birthdayQuote}
                onChange={handleInputChange}
                placeholder="Leave blank for an inspiring custom birthday message..."
                rows="3"
                className="glass-input px-4 py-3 rounded-xl text-sm resize-none"
              />
            </div>

            {/* Drag & Drop Photo Upload */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Student Portrait Photo
              </label>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  photoPreview 
                    ? 'border-luxury-purple-light/50 bg-luxury-purple-dark/10' 
                    : 'border-white/10 hover:border-white/20 bg-white/2'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {photoPreview ? (
                  <div className="flex flex-col items-center gap-3">
                    <img 
                      src={photoPreview} 
                      alt="Uploaded Portrait Preview" 
                      className="w-24 h-24 rounded-full object-cover border-2 border-luxury-purple-light shadow-lg"
                    />
                    <div className="text-xs text-purple-200 font-semibold">{photo.name}</div>
                    <div className="text-xxs text-slate-500">Click or drag another image to replace</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <FiUploadCloud className="text-4xl text-slate-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-semibold text-slate-200">Drag & drop portrait or click to upload</span>
                    <span className="text-xxs text-slate-500">Supports PNG, JPG, JPEG, WEBP (max 10MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2.5"
              >
                <FiAlertCircle className="text-lg flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 transition-all shadow-lg ${
                loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                  : 'btn-primary'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                  Generating Posters...
                </>
              ) : (
                <>
                  <FiStar />
                  Generate All 3 Posters
                </>
              )}
            </button>

          </form>
        </motion.div>

        {/* Right Side: Poster Previews */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full justify-start">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FiEye className="text-luxury-blue-light" />
              Generated Posters Preview
            </h3>
            {posters && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-luxury-blue-dark/50 border border-luxury-blue/30 text-luxury-blue-light flex items-center gap-1.5">
                <FiCheck /> 3 Templates Ready
              </span>
            )}
          </div>

          {/* Skeleton Loaders / Empty State / Poster Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[1, 2, 3].map((skeletonIdx) => (
                <div key={skeletonIdx} className="glass-panel rounded-2xl border border-white/5 p-4 flex flex-col gap-4 animate-pulse">
                  <div className="aspect-[4/5] rounded-xl bg-slate-900/60 w-full" />
                  <div className="h-4 bg-slate-800 w-2/3 rounded" />
                  <div className="h-8 bg-slate-800 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : posters ? (
            /* Posters Rendered Grid */
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6"
            >
              {/* Luxury Purple */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-md group-hover:shadow-2xl transition-all duration-300" onClick={() => onOpenPreview(posters.luxuryPurple, 'Luxury Purple')}>
                  <img 
                    src={posters.luxuryPurple} 
                    alt="Luxury Purple Poster" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <div className="p-3 rounded-full bg-luxury-purple text-white shadow-lg border border-purple-500/20 transform scale-75 group-hover:scale-100 transition-transform">
                      <FiEye className="text-lg" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-purple-300">Luxury Purple</span>
                  <button 
                    onClick={() => downloadPoster(posters.luxuryPurple, 'luxury-purple')}
                    className="p-2 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-luxury-purple hover:border-luxury-purple/50 transition-colors"
                  >
                    <FiDownload />
                  </button>
                </div>
              </div>

              {/* Royal Blue */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-md group-hover:shadow-2xl transition-all duration-300" onClick={() => onOpenPreview(posters.royalBlue, 'Royal Blue')}>
                  <img 
                    src={posters.royalBlue} 
                    alt="Royal Blue Poster" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <div className="p-3 rounded-full bg-luxury-blue text-white shadow-lg border border-blue-500/20 transform scale-75 group-hover:scale-100 transition-transform">
                      <FiEye className="text-lg" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-blue-300">Royal Blue</span>
                  <button 
                    onClick={() => downloadPoster(posters.royalBlue, 'royal-blue')}
                    className="p-2 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-luxury-blue hover:border-luxury-blue/50 transition-colors"
                  >
                    <FiDownload />
                  </button>
                </div>
              </div>

              {/* Black Gold */}
              <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer shadow-md group-hover:shadow-2xl transition-all duration-300" onClick={() => onOpenPreview(posters.blackGold, 'Black Gold')}>
                  <img 
                    src={posters.blackGold} 
                    alt="Black Gold Poster" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                    <div className="p-3 rounded-full bg-luxury-gold-dark text-white shadow-lg border border-yellow-500/20 transform scale-75 group-hover:scale-100 transition-transform">
                      <FiEye className="text-lg" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-bold text-yellow-300">Black Gold</span>
                  <button 
                    onClick={() => downloadPoster(posters.blackGold, 'black-gold')}
                    className="p-2 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-luxury-gold-dark hover:border-luxury-gold/50 transition-colors"
                  >
                    <FiDownload />
                  </button>
                </div>
              </div>

            </motion.div>
          ) : (
            /* Empty State */
            <div className="flex-grow glass-panel border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-12 text-center min-h-[350px]">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <FiStar className="text-2xl" />
              </div>
              <h4 className="text-lg font-bold text-slate-200 mb-2">No Posters Generated Yet</h4>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Complete the Student Details form on the left and upload a portrait to create 3 completely unique, premium birthday posters instantly.
              </p>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
