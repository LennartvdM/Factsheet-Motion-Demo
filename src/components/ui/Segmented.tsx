import { forwardRef, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn';

type SegmentedType = 'radio' | 'tab';

type SegmentedOption = {
  label: string;
  value: string;
  id?: string;
  controls?: string;
};

type SegmentedProps = {
  options: SegmentedOption[];
  value: string;
  onValueChange: (value: string) => void;
  type?: SegmentedType;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  className?: string;
  id?: string;
};

const containerRoles: Record<SegmentedType, string> = {
  radio: 'radiogroup',
  tab: 'tablist'
};

const itemRoles: Record<SegmentedType, string> = {
  radio: 'radio',
  tab: 'tab'
};

export const Segmented = forwardRef<HTMLDivElement, SegmentedProps>(function Segmented(
  { options, value, onValueChange, type = 'radio', ariaLabel, ariaLabelledBy, className, id },
  ref
) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastIndex = options.length - 1;

  const activeIndex = useMemo(() => {
    const index = options.findIndex((option) => option.value === value);
    return index === -1 ? 0 : index;
  }, [options, value]);

  const [focusIndex, setFocusIndex] = useState(activeIndex);

  useEffect(() => {
    setFocusIndex(activeIndex);
  }, [activeIndex]);

  const focusOption = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(index, lastIndex));
    const nextOption = optionRefs.current[clampedIndex];
    if (nextOption) {
      nextOption.focus();
    }
    setFocusIndex(clampedIndex);
  };

  const selectIndex = (index: number) => {
    const option = options[index];
    if (!option || option.value === value) {
      return;
    }
    onValueChange(option.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        nextIndex = index + 1 > lastIndex ? 0 : index + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        nextIndex = index - 1 < 0 ? lastIndex : index - 1;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        selectIndex(index);
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    if (nextIndex !== null) {
      focusOption(nextIndex);
      selectIndex(nextIndex);
    }
  };

  return (
    <div
      ref={ref}
      id={id}
      role={containerRoles[type]}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'inline-flex items-center gap-1 rounded-2xl bg-[rgba(var(--color-surface-muted),0.65)] p-1 shadow-inner shadow-[rgba(var(--color-overlay),0.15)] transition-colors',
        className
      )}
    >
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            id={option.id}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            type="button"
            role={itemRoles[type]}
            aria-checked={type === 'radio' ? isActive : undefined}
            aria-selected={type === 'tab' ? isActive : undefined}
            aria-controls={option.controls}
            tabIndex={index === focusIndex ? 0 : -1}
            data-state={isActive ? 'active' : 'inactive'}
            onClick={() => {
              focusOption(index);
              selectIndex(index);
            }}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'relative rounded-xl px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(var(--color-accent),0.65)] focus-visible:ring-offset-1 focus-visible:ring-offset-[rgba(var(--color-bg),0.75)]',
              isActive
                ? 'bg-[rgb(var(--color-accent))] text-white shadow-sm'
                : 'text-muted hover:bg-[rgba(var(--color-card),0.85)] hover:text-[rgb(var(--color-text))]'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
});
