'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import styles from '../../styles/commandes.module.css';

type Props = {
    statusParam: string;
    initialQuery: string;
};

export default function CommandesSearch({ statusParam, initialQuery }: Props) {
    const router = useRouter();
    const [value, setValue] = useState(initialQuery);
    const [isPending, startTransition] = useTransition();
    const skipDebounceRef = useRef(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current && document.activeElement === inputRef.current) {
            return;
        }
        setValue(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        if (skipDebounceRef.current) {
            skipDebounceRef.current = false;
            return;
        }
        const t = window.setTimeout(() => {
            const p = new URLSearchParams();
            p.set('status', statusParam);
            const q = value.trim();
            if (q) p.set('q', q);
            startTransition(() => {
                router.replace(`/dashboard/commandes?${p.toString()}`);
            });
        }, 280);
        return () => window.clearTimeout(t);
    }, [value, statusParam, router]);

    const clear = () => setValue('');

    return (
        <div
            className={styles.commandesSearchBar}
            role="search"
            aria-label="Rechercher dans les commandes"
        >
            <div
                className={`${styles.commandesSearch} ${isPending ? styles.commandesSearchPending : ''}`}
            >
                <span className={styles.commandesSearchIcon} aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </span>
                <input
                    ref={inputRef}
                    type="search"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            clear();
                        }
                    }}
                    placeholder="ID, nom, téléphone, adresse…"
                    className={styles.commandesSearchInput}
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-busy={isPending}
                />
                {value ? (
                    <button
                        type="button"
                        className={styles.commandesSearchClear}
                        onClick={clear}
                        aria-label="Effacer la recherche"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                ) : null}
            </div>
        </div>
    );
}
