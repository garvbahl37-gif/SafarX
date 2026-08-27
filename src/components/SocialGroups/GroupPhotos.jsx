import React from 'react';
import { Camera, Heart, Download, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const GroupPhotos = ({ group }) => {
  const fileInputRef = React.useRef(null);
  // Mock photos
  const [localPhotos, setLocalPhotos] = React.useState(group.gallery || [
    { id: 1, url: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', caption: 'Community', user: 'Pexels' },
    { id: 2, url: 'https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260', caption: 'Adventure', user: 'Pexels' }
  ]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalPhotos(prev => [{
          id: Date.now(),
          url: reader.result,
          caption: 'New Upload',
          user: 'You'
        }, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Photos ({localPhotos.length})</h2>
          <p className="text-sm text-gray-500 font-medium">Memories shared by members</p>
        </div>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-700 transition-colors shadow-lg shadow-cyan-500/30 text-sm"
          >
            <Camera size={18} />
            Upload Photo
          </button>
        </div>
      </div>

      {/* Albums Filter */}
      <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-hide">
        {['All Photos', 'Meetups', 'Places', 'Food', 'Culture'].map((album, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${i === 0
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {album}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {localPhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ y: -5 }}
            className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all"
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              <p className="text-white font-bold truncate">{photo.caption}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-white/80 text-xs">by {photo.user}</p>
                <div className="flex gap-2">
                  <button className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40"><Heart size={14} /></button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = photo.url;
                      link.download = `safar-photo-${photo.id}.jpg`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="p-1.5 bg-white/20 rounded-full text-white hover:bg-white/40"
                  >
                    <Download size={14} />
                  </button>
                  {/* Delete Button (Mock functionality) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this photo?')) {
                        setLocalPhotos(localPhotos.filter(p => p.id !== photo.id));
                      }
                    }}
                    className="p-1.5 bg-red-500/80 rounded-full text-white hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default GroupPhotos;
