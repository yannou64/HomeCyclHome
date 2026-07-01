import { useEffect, useRef, useState } from 'react';
import { authService } from '../services/authService';

export function useConfirmEmail(token: string | null) {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        token ? 'loading' : 'error',
    );
    const called = useRef(false);

    useEffect(() => {
        if (!token || called.current) return;
        called.current = true; // verrou : un seul appel possible

        void (async () => {
            try {
                await authService.confirmEmail(token);
                setStatus('success');
            } catch {
                setStatus('error');
            }
        })();
    }, [token]);

    return { status };
}
