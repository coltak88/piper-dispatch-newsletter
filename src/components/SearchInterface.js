import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SearchInterface = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // API configuration for search suggestions
  const SEARCH_API_CONFIG = {
    baseUrl: process.env.REACT_APP_SEARCH_API_URL || 'https://api.piperdispatch.com',
    endpoints: {
      suggestions: '/v1/search/suggestions',
      trending: '/v1/search/trending'
    }
  };

  // Fetch intelligent search suggestions
  const fetchSearchSuggestions = async (searchQuery) => {
    try {
      const response = await fetch(`${SEARCH_API_CONFIG.baseUrl}${SEARCH_API_CONFIG.endpoints.suggestions}?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('searchToken')}`,
          'X-Privacy-Level': 'minimal',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error(`Search suggestions failed: ${response.status}`);
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Search suggestions fetch failed:', error);
      // Fallback suggestions
      return [
        'Market Intelligence',
        'Technology Trends',
        'Investment Analysis',
        'Economic Indicators',
        'Innovation Reports'
      ].filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  };

  useEffect(() => {
     const getSuggestions = async () => {
       if (query.length > 2) {
         const suggestions = await fetchSearchSuggestions(query);
         setSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
       } else {
         setSuggestions([]);
       }
     };
 
     const debounceTimer = setTimeout(getSuggestions, 300);
     return () => clearTimeout(debounceTimer);
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