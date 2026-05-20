'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion-lite';
import { Check, ChevronDown } from 'lucide-react';
import Image from '@/components/common/AppImage';
import { useCountryStore } from '@/store/useStore';
import { COUNTRIES } from '@/lib/api/config';
import { cn } from '@/lib/utils';

const FLAG_MAPPING: Record<string, string> = {
  jo: 'jordan.svg',
  sa: 'saudi.svg',
  eg: 'egypt.svg',
  ps: 'palestine.svg',
};

function getFlagUrl(code: string) {
  return `/assets/img/flags/${FLAG_MAPPING[code.toLowerCase()] || 'jordan.svg'}`;
}

interface CountrySelectorProps {
  variant?: 'compact' | 'panel';
  dropdownMode?: 'floating' | 'inline';
}

export default function CountrySelector({
  variant = 'compact',
  dropdownMode = 'floating',
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { country: selectedCountry, setCountry } = useCountryStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const shouldReloadRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: typeof COUNTRIES[number]) => {
    shouldReloadRef.current = true;
    setCountry(country);
    setIsOpen(false);
  };

  useEffect(() => {
    if (!shouldReloadRef.current) return;
    document.cookie = `country_id=${selectedCountry.id}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    document.cookie = `country_code=${selectedCountry.code}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

    // Check if URL contains country code and update it
    const currentPath = window.location.pathname;
    const pathParts = currentPath.split('/');
    const countryCodes = COUNTRIES.map(c => c.code);

    // pathParts[0] is empty because path starts with /
    if (pathParts.length > 1 && countryCodes.includes(pathParts[1] as any)) {
      pathParts[1] = selectedCountry.code;
      const newPath = pathParts.join('/');
      window.location.href = newPath + window.location.search + window.location.hash;
    } else {
      window.location.reload();
    }
  }, [selectedCountry]);

  return (
    <div className={cn('relative', variant === 'panel' && 'w-full')} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-secondary/50',
          variant === 'panel' &&
            'h-12 w-full justify-between rounded-xl border-white/10 bg-white/10 px-3 py-2 text-white hover:border-white/20 hover:bg-white/15'
        )}
        aria-label="اختر الدولة"
        title={selectedCountry.name}
      >
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
            <Image 
              src={getFlagUrl(selectedCountry.code)} 
              alt={selectedCountry.name}
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
          {variant === 'panel' ? (
            <span className="truncate text-sm font-black">{selectedCountry.name}</span>
          ) : null}
        </div>
        <ChevronDown 
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            variant === 'panel' && 'text-white/80',
            isOpen && "rotate-180"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              'z-50 max-h-80 overflow-y-auto rounded-xl border border-border bg-card py-1 shadow-lg scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/10',
              dropdownMode === 'floating' && 'absolute left-0 top-full mt-2 w-56',
              dropdownMode === 'inline' && 'relative mt-2 w-full max-h-64 bg-white text-slate-900'
            )}
          >
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border mb-1">
              اختر الدولة
            </div>
            {COUNTRIES.map((country) => (
              <button
                key={country.id}
                onClick={() => handleSelect(country)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-secondary/50",
                  selectedCountry.id === country.id ? "text-primary font-medium bg-primary/5" : "text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full overflow-hidden shadow-sm flex items-center justify-center bg-white relative">
                    <Image 
                      src={getFlagUrl(country.code)} 
                      alt={country.name}
                      fill
                      sizes="20px"
                      className="object-cover"
                    />
                  </div>
                  <span>{country.name}</span>
                </div>
                {selectedCountry.id === country.id && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

