'use client';

import { useEffect, useState } from 'react';

export default function Watermark() {
    const [isRecording, setIsRecording] = useState(false);

    useEffect(() => {
        // Detectar posibles grabaciones de pantalla
        const checkRecording = async () => {
            try {
                // Verificar si hay acceso a la pantalla (posible grabación)
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                setIsRecording(true);
                stream.getTracks().forEach(track => track.stop());
            } catch (error) {
                setIsRecording(false);
            }
        };

        // Verificar periódicamente
        const interval = setInterval(checkRecording, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Watermark fijo */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' fill='rgba(255,0,0,0.1)' text-anchor='middle' dominant-baseline='middle'%3E© Codexia - No copiar%3C/text%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '200px 200px',
                    opacity: 0.3,
                }}
            />

            {/* Overlay si se detecta grabación */}
            {isRecording && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(255, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: 'bold',
                    }}
                >
                    ⚠️ GRABACIÓN DETECTADA - CONTENIDO PROTEGIDO ⚠️
                </div>
            )}

            {/* Mensaje de seguridad */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    zIndex: 10001,
                }}
            >
                Contenido protegido © Codexia
            </div>
        </>
    );
}