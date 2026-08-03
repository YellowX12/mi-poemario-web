"use client";

import { useEffect, useState } from 'react';

export default function ModoNocheToggle() {
    const [modoNoche, setModoNoche] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem('modo-noche') === 'true';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('modo-noche', modoNoche);
        window.localStorage.setItem('modo-noche', String(modoNoche));
    }, [modoNoche]);

    return (
        <button
            type="button"
            className="modo-noche-boton"
            style={{
                position: 'fixed',
                bottom: '24px',
                left: '24px',
                zIndex: 9999,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '48px',
                minWidth: '150px',
                textAlign: 'center',
            }}
            onClick={() => setModoNoche(prev => !prev)}
        >
            {modoNoche ? 'Modo claro' : 'Modo noche'}
        </button>
    );
}
