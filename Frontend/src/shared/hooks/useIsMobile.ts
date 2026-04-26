import { useEffect, useState } from 'react';

export function useIsMobile(breakpoint = 1024): boolean {
    const [isMobile, setIsMobile] = useState(
        () => window.innerWidth < breakpoint,
    );

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < breakpoint);
        window.addEventListener('resize', handler);
        // Nettoyage : retire le listener quand le composant se démonte
        return () => window.removeEventListener('resize', handler);
    }, [breakpoint]);

    return isMobile;
}
