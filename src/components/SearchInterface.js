import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SearchInterface = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length > 2) {
      // Simulate search suggestions
      const mockSuggestions = [
        'Market Analysis',
        'Tech Trends',
        'Investment Insights',
        'Economic Indicators'
      ].filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (onSearch) {
      onSearch(searchQuery);
    }
    setIsActive(false);
    setSuggestions([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-interface">
      <motion.div 
        className={`search-container ${isActive ? 'search-container--active' : ''}`}
        whileFocus={{ scale: 1.02 }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsActive(true)}
          onBlur={() => setTimeout(() => setIsActive(false), 200)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="search-input"
          aria-label="Search"
        />
        <button 
          onClick={() => handleSearch()}
          className="search-button"
          aria-label="Execute search"
        >
          🔍
        </button>
      </motion.div>
      
      {suggestions.length > 0 && isActive && (
        <motion.div 
          className="search-suggestions"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="search-suggestion"
              onClick={() => handleSearch(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default SearchInterface;