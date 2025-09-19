import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ArchiveViewer = ({ archives = [] }) => {
  const [selectedArchive, setSelectedArchive] = useState(null);
  const [filteredArchives, setFilteredArchives] = useState(archives);
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    let filtered = archives;
    
    if (filterDate) {
      filtered = filtered.filter(archive => 
        archive.date.includes(filterDate)
      );
    }
    
    if (filterCategory !== 'all') {
      filtered = filtered.filter(archive => 
        archive.category === filterCategory
      );
    }
    
    setFilteredArchives(filtered);
  }, [archives, filterDate, filterCategory]);

  const categories = ['all', 'market-analysis', 'tech-trends', 'investment-insights'];

  return (
    <div className="archive-viewer">
      <div className="archive-filters">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="archive-date-filter"
          aria-label="Filter by date"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="archive-category-filter"
          aria-label="Filter by category"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div className="archive-grid">
        {filteredArchives.map((archive, index) => (
          <motion.div
            key={archive.id || index}
            className="archive-item"
            whileHover={{ scale: 1.02 }}
            onClick={() => setSelectedArchive(archive)}
          >
            <h3 className="archive-title">{archive.title}</h3>
            <p className="archive-date">{archive.date}</p>
            <p className="archive-excerpt">{archive.excerpt}</p>
            <span className="archive-category">{archive.category}</span>
          </motion.div>
        ))}
      </div>

      {selectedArchive && (
        <motion.div 
          className="archive-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedArchive(null)}
        >
          <motion.div 
            className="archive-modal-content"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="archive-modal-close"
              onClick={() => setSelectedArchive(null)}
              aria-label="Close archive"
            >
              ×
            </button>
            <h2>{selectedArchive.title}</h2>
            <p className="archive-meta">{selectedArchive.date} | {selectedArchive.category}</p>
            <div className="archive-content">
              {selectedArchive.content || selectedArchive.excerpt}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ArchiveViewer;