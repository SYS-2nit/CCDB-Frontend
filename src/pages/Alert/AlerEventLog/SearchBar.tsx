import React from "react";

interface SearchBarProps {
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder }) => {
  return (
    <div className="search-bar">
      <input type="text" placeholder={placeholder} />
      <button>검색</button>
    </div>
  );
};

export default SearchBar;
