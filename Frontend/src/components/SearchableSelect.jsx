import React, { useState, useRef, useEffect } from 'react';
import { IoChevronDown, IoSearch, IoClose } from 'react-icons/io5';

/**
 * A premium searchable select (combobox/autocomplete) component.
 * 
 * @param {Object} props
 * @param {Array} props.options - Array of { id, label, sublabel }
 * @param {string|number} props.value - Currently selected ID
 * @param {function} props.onChange - Selection change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.label - Field label
 * @param {string} props.error - Error message
 */
export default function SearchableSelect({ options = [], value, onChange, placeholder = "Select an option...", label, error }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const selectedOption = options.find(opt => String(opt.id) === String(value));

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.sublabel?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && <label className="label-base">{label}</label>}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`input-base flex justify-between items-center cursor-pointer min-h-[48px] ${isOpen ? 'ring-4 ring-blue-500/10 border-blue-500 bg-white' : ''} ${error ? 'border-red-500' : ''}`}
            >
                <div className="flex-1 truncate">
                    {selectedOption ? (
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-gray-900">{selectedOption.label}</span>
                            {selectedOption.sublabel && <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tight">{selectedOption.sublabel}</span>}
                        </div>
                    ) : (
                        <span className="text-gray-400 text-sm font-medium">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    {value && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onChange(''); }}
                            className="hover:text-red-500 transition-colors p-1"
                        >
                            <IoClose size={16} />
                        </button>
                    )}
                    <IoChevronDown size={18} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
                </div>
            </div>

            {error && <p className="mt-1 text-xs text-red-600 font-bold ml-1">{error}</p>}

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-[110] w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-zoom-in">
                    <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                        <IoSearch className="text-gray-400" size={18} />
                        <input
                            autoFocus
                            type="text"
                            className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder-gray-400 font-medium"
                            placeholder="Type to search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="max-h-[240px] overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={(e) => { e.stopPropagation(); handleSelect(option); }}
                                    className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex flex-col border-b border-gray-50 last:border-0 transition-all ${String(value) === String(option.id) ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                >
                                    <span className={`text-sm font-black ${String(value) === String(option.id) ? 'text-blue-600' : 'text-gray-900'}`}>{option.label}</span>
                                    {option.sublabel && <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight mt-0.5">{option.sublabel}</span>}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">
                                No matching units found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
