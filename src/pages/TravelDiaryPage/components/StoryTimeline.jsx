import { motion } from 'framer-motion';
import { MapPin, Calendar, Sun, Heart, Compass, Sparkles } from 'lucide-react';

export const StoryTimeline = ({ photos, tripTitle, summary, travelerName }) => {
  return (
    <div className="space-y-8">
      {/* Editorial Journal Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-widest">
          <Sparkles size={12} />
          <span>SafarX Digital Travel Journal</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
          {tripTitle || 'Chronicles of Rajasthan'}
        </h2>
        {travelerName && (
          <p className="text-sm text-amber-500/90 font-medium">
            Documented by {travelerName}
          </p>
        )}
        {summary && (
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic">
            "{summary}"
          </p>
        )}
      </div>

      {/* Vertical Timeline Feed */}
      <div className="relative max-w-4xl mx-auto pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-amber-500 before:via-sky-500 before:to-indigo-500">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id || index}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="relative group"
          >
            {/* Timeline Node Icon */}
            <div className="absolute -left-6 sm:-left-10 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-950 border-2 border-amber-500 flex items-center justify-center text-amber-400 text-[10px] sm:text-xs font-bold shadow-lg shadow-amber-500/20">
              {index + 1}
            </div>

            {/* Story Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 backdrop-blur-xl group-hover:border-amber-500/30 transition-all space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                    {photo.day || `Day 0${(index % 7) + 1}`}
                  </span>
                  {photo.tag && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {photo.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                  {photo.weather && (
                    <span className="flex items-center gap-1">
                      <Sun size={12} className="text-amber-400" />
                      {photo.weather}
                    </span>
                  )}
                  <span>{photo.date || 'Rajasthan Milestone'}</span>
                </div>
              </div>

              {/* Title & Caption */}
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-amber-500 shrink-0" />
                  {photo.location}
                </h3>
                {photo.caption && (
                  <p className="text-slate-300 text-sm sm:text-base italic mt-1.5 leading-relaxed">
                    "{photo.caption}"
                  </p>
                )}
              </div>

              {/* Photo Display */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-slate-950">
                <img
                  src={photo.url}
                  alt={photo.location}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
