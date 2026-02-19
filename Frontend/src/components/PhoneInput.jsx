import { useState, useEffect, useRef } from 'react';
import { IoChevronDown, IoSearch } from 'react-icons/io5';
import { countries } from '../utils/countries';

export default function PhoneInput({ label, value, onChange, error, placeholder }) {
    const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === 'EG') || countries[0]);
    const [localNumber, setLocalNumber] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (value) {
            // Try to parse incoming E.164 value
            // Sort by length of dialCode descending to match longest possible prefix first (e.g., +1 vs +1684)
            const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
            const matchedCountry = sortedCountries.find(c => value.startsWith(c.dialCode));

            if (matchedCountry) {
                setSelectedCountry(matchedCountry);
                setLocalNumber(value.replace(matchedCountry.dialCode, ''));
            } else {
                setLocalNumber(value);
            }
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dialCode.includes(searchTerm) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCountrySelect = (country) => {
        setSelectedCountry(country);
        const newValue = country.dialCode + localNumber;
        onChange(newValue);
        setIsDropdownOpen(false);
        setSearchTerm('');
    };

    const handleNumberChange = (e) => {
        const raw = e.target.value;

        // If user types a number starting with +, try to auto-detect country
        if (raw.startsWith('+')) {
            const digitsAndPlus = raw.replace(/[^\d+]/g, '');
            const sortedCountries = [...countries].sort((a, b) => b.dialCode.length - a.dialCode.length);
            const matched = sortedCountries.find(c => digitsAndPlus.startsWith(c.dialCode));
            if (matched) {
                setSelectedCountry(matched);
                const local = digitsAndPlus.slice(matched.dialCode.length);
                setLocalNumber(local);
                // Strip leading zero when combining with dial code for E.164
                onChange(matched.dialCode + local.replace(/^0+/, ''));
            } else {
                setLocalNumber(digitsAndPlus);
                onChange(digitsAndPlus);
            }
            return;
        }

        // Normal local number input — allow digits only, keep as typed (including leading zeros)
        const digits = raw.replace(/\D/g, '');
        setLocalNumber(digits);
        // Strip leading zero only when building full E.164 number for validation
        onChange(selectedCountry.dialCode + digits.replace(/^0+/, ''));
    };


    return (
        <div className="w-full relative">
            {label && <label className="label-base">{label}</label>}

            {/* Main Input Wrapper - Removed overflow-hidden to prevent dropdown clipping */}
            <div className="flex gap-0 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">

                {/* Custom Dropdown Trigger */}
                <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 transition-colors min-w-[110px] rounded-l-xl h-full"
                    >
                        <img
                            src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                            alt={selectedCountry.name}
                            className="w-5 h-3.5 object-cover rounded-sm shadow-sm"
                        />
                        <span className="text-sm font-black text-gray-800 tracking-tight">{selectedCountry.dialCode}</span>
                        <IoChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu - Positioned with high z-index and clear background */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-72 max-h-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-[9999] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200 border-t-4 border-t-blue-500">
                            <div className="p-3 border-b border-gray-100 bg-gray-50/80 sticky top-0">
                                <div className="relative">
                                    <IoSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Search by country or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-medium"
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-grow custom-scrollbar py-1">
                                {filteredCountries.map((c) => (
                                    <button
                                        key={`${c.code}-${c.dialCode}`}
                                        type="button"
                                        onClick={() => handleCountrySelect(c)}
                                        className={`w-full flex items-center gap-4 px-4 py-2.5 text-left hover:bg-blue-50/80 transition-all ${selectedCountry.code === c.code ? 'bg-blue-50 border-r-4 border-blue-500' : 'border-r-4 border-transparent'}`}
                                    >
                                        <img
                                            src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                                            alt={c.name}
                                            className="w-6 h-4 object-cover rounded-sm shadow-xs shrink-0"
                                        />
                                        <div className="flex flex-col flex-grow">
                                            <span className="text-[13px] font-black text-gray-900 leading-tight">{c.name}</span>
                                            <span className="text-[11px] text-blue-600 font-bold tracking-wider">{c.dialCode}</span>
                                        </div>
                                        {selectedCountry.code === c.code && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </button>
                                ))}
                                {filteredCountries.length === 0 && (
                                    <div className="p-8 text-center">
                                        <div className="text-gray-300 mb-2"><IoSearch size={32} className="mx-auto" /></div>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No matching countries</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Local Number Input */}
                <input
                    type="text"
                    value={localNumber}
                    onChange={handleNumberChange}
                    className="flex-grow px-5 py-2.5 text-sm font-black text-gray-800 focus:outline-none bg-white placeholder-gray-300 rounded-r-xl"
                    placeholder={placeholder || "Type number or +code..."}
                />
            </div>

            {error && <p className="mt-2 text-[11px] text-red-500 font-black flex items-center gap-1.5 px-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
                {error}
            </p>}
        </div>
    );
}
