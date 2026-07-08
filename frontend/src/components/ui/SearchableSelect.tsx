import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  defaultLabel?: string; // e.g. "Semua Status"
}

export function SearchableSelect({
  value,
  onChange,
  options,
  className,
  defaultLabel = "Semua"
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update internal search text when dropdown closes or value changes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = value === 'ALL' || !value 
    ? defaultLabel 
    : options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input 
          type="text"
          value={isOpen ? search : ''}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (!e.target.value) onChange('ALL');
          }}
          placeholder={isOpen ? "Cari..." : selectedLabel}
          className={cn(
            "w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-red-500 cursor-pointer placeholder-slate-800 dark:placeholder-slate-200",
            className
          )}
        />
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-[100] max-h-48 overflow-y-auto custom-scrollbar">
          <div 
            className="p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700/50"
            onClick={() => { onChange('ALL'); setIsOpen(false); }}
          >
            {defaultLabel}
          </div>
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-xs text-slate-400 text-center italic">Tidak ditemukan</div>
          ) : (
            filteredOptions.map(opt => (
              <div 
                key={opt.value} 
                className="p-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
