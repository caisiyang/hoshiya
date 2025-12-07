'use client';

import clsx from 'clsx';
import { ReactNode, useEffect, useState } from 'react';

export default function StickyNavbar({ children }: { children: ReactNode }) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={clsx(
                'fixed top-0 z-50 w-full transition-all duration-300 border-b',
                {
                    'bg-transparent border-transparent': !isScrolled,
                    'bg-white/90 backdrop-blur-md border-neutral-100 shadow-sm': isScrolled
                }
            )}
        >
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
                {children}
            </div>
        </nav>
    );
}
