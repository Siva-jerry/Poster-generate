import {
  Search,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import "./SearchBar.css";

function SearchBar({
  value,
  onChange,
  placeholder =
    "Search luxury, neon, floral...",
}) {
  const [
    localValue,
    setLocalValue,
  ] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        if (
          localValue !== value
        ) {
          onChange(localValue);
        }
      },
      450
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    localValue,
    onChange,
    value,
  ]);

  const clearSearch = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="gallery-search">
      <Search
        size={20}
        className="gallery-search__icon"
      />

      <input
        type="search"
        value={localValue}
        placeholder={placeholder}
        aria-label="Search templates"
        onChange={(event) =>
          setLocalValue(
            event.target.value
          )
        }
      />

      {localValue && (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default SearchBar;