import { Search } from 'lucide-react';
import { useId } from 'react';
import { controlClasses } from '@/components/ui/control-classes';
import { cn } from '@/utils/cn';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  label,
  placeholder = 'Buscar...',
  className,
}: SearchInputProps) {
  const id = useId();
  return (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="text-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(controlClasses, 'h-10 pl-9')}
      />
    </div>
  );
}
