import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Clock, Star } from "lucide-react";

const SearchWidget = ({ onSearch, suggestions = [], isLoading = false }) => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (query.length > 2) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSearch(suggestions[selectedIndex].title);
          setQuery(suggestions[selectedIndex].title);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.title);
    handleSearch(suggestion.title);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 2 && setShowSuggestions(true)}
          placeholder="Search heritage sites, festivals, arts, or ask questions..."
          className="w-full pl-11 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 outline-none transition-all duration-200 shadow-lg"
        />

        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-saffron-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id || index}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                selectedIndex === index
                  ? "bg-saffron-50 border-saffron-200"
                  : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon based on type */}
                <div className="flex-shrink-0 mt-1">
                  {suggestion.type === "heritage" && (
                    <div className="text-orange-500">🏛️</div>
                  )}
                  {suggestion.type === "festival" && (
                    <div className="text-purple-500">🎭</div>
                  )}
                  {suggestion.type === "art" && (
                    <div className="text-pink-500">🎨</div>
                  )}
                  {suggestion.type === "gem" && (
                    <div className="text-blue-500">💎</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-gray-900 mb-1">
                    {highlightMatch(suggestion.title, query)}
                  </div>

                  {suggestion.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {suggestion.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {suggestion.state && (
                      <div className="flex items-center space-x-1">
                        <MapPin size={12} />
                        <span>{suggestion.state}</span>
                      </div>
                    )}

                    {suggestion.category && (
                      <div className="flex items-center space-x-1">
                        <Clock size={12} />
                        <span>{suggestion.category}</span>
                      </div>
                    )}

                    {suggestion.rating && (
                      <div className="flex items-center space-x-1">
                        <Star
                          size={12}
                          className="text-yellow-400 fill-current"
                        />
                        <span>{suggestion.rating}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Search Categories */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {[
          { label: "🏛️ Monuments", query: "monuments" },
          { label: "🎭 Festivals", query: "festivals" },
          { label: "🎨 Classical Arts", query: "classical dance" },
          { label: "💎 Hidden Gems", query: "hidden places" },
          { label: "🕌 Architecture", query: "architecture" },
          { label: "📚 History", query: "history" },
        ].map((category, index) => (
          <button
            key={index}
            onClick={() => handleSearch(category.query)}
            className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-full hover:border-saffron-500 hover:text-saffron-600 transition-colors"
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchWidget;
