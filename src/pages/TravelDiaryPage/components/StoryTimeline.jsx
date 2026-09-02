import { motion } from 'framer-motion';
import { MapPin, Calendar, Sun, Heart, Compass, Sparkles } from 'lucide-react';

export const StoryTimeline = ({ photos, tripTitle, summary, travelerName }) => {
  return (
    <div className="space-y-8">
      {/* Editorial Journal Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron-bright text-xs font-semibold uppercase tracking-widest">
          <Sparkles size={12} />
          <span>SafarX Digital Travel Journal</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-ivory tracking-tight">
          {tripTitle || 'Chronicles of Rajasthan'}
        </h2>
        {travelerName && (
          <p className="text-sm text-saffron/90 font-medium">
            Documented by {travelerName}
          </p>
        )}
        {summary && (
          <p className="text-ivory-muted text-sm sm:text-base leading-relaxed italic">
            "{summary}"
          </p>
        )}
      </div>

      {/* Vertical Timeline Feed */}
      <div className="relative max-w-4xl mx-auto pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-saffron before:via-horizon before:to-horizon">
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
            <div className="absolute -left-6 sm:-left-10 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-ink-950 border-2 border-saffron flex items-center justify-center text-saffron-bright text-[10px] sm:text-xs font-bold shadow-lg shadow-saffron/20">
              {index + 1}
            </div>

            {/* Story Card */}
            <div className="bg-ink-900/80 border border-ink-800 rounded-3xl p-5 sm:p-7 backdrop-blur-xl group-hover:border-saffron/30 transition-all space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-saffron/10 text-saffron-bright font-bold border border-saffron/20">
                    {photo.day || `Day 0${(index % 7) + 1}`}
                  </span>
                  {photo.tag && (
                    <span className="px-2.5 py-0.5 rounded-full bg-ink-800 text-ivory-muted font-medium">
                      {photo.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-ivory-muted text-[11px] font-data">
                  {photo.weather && (
                    <span className="flex items-center gap-1">
                      <Sun size={12} className="text-saffron-bright" />
                      {photo.weather}
                    </span>
                  )}
                  <span>{photo.date || 'Rajasthan Milestone'}</span>
                </div>
              </div>

              {/* Title & Caption */}
              <div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-ivory flex items-center gap-2">
                  <MapPin size={18} className="text-saffron shrink-0" />
                  {photo.location}
                </h3>
                {photo.caption && (
                  <p className="text-ivory-muted text-sm sm:text-base italic mt-1.5 leading-relaxed">
                    "{photo.caption}"
                  </p>
                )}
              </div>

              {/* Photo Display */}
              <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-ink-950">
                <img
                  src={photo.url}
                  alt={photo.location}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
