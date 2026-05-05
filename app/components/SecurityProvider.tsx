'use client';

// 1. Importamos ReactNode aquí arriba
import { useEffect, ReactNode } from 'react';
import Watermark from './Watermark';

// 2. Usamos ReactNode directamente
export default function SecurityProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Bloquear getDisplayMedia (compartir pantalla/grabación)
        const browserNavigator = navigator as unknown as {
            mediaDevices?: {
                getDisplayMedia?: () => Promise<MediaStream>;
            };
            getScreenDetails?: () => Promise<unknown>;
        };

        if (browserNavigator.mediaDevices?.getDisplayMedia) {
            browserNavigator.mediaDevices.getDisplayMedia = () => {
                return Promise.reject(new Error('Screen capture is disabled.'));
            };
        }

        // Bloquear getScreenDetails (API de pantalla)
        if (browserNavigator.getScreenDetails) {
            browserNavigator.getScreenDetails = () => {
                return Promise.reject(new Error('Screen details are disabled.'));
            };
        }

        // Las operaciones básicas de copiar y pegar en formularios se controlan en el formulario.

        // Detectar intentos de captura de pantalla (cambio de pestaña)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // 3. Usamos setProperty en lugar de .filter
                document.body.style.setProperty('filter', 'blur(10px)');
                document.body.style.pointerEvents = 'none';
                setTimeout(() => {
                    document.body.style.removeProperty('filter');
                    document.body.style.pointerEvents = '';
                }, 1000);
            }
        };

        // Detectar pérdida de foco (posible captura externa)
        const handleBlur = () => {
            // 4. Usamos setProperty en lugar de .filter
            document.body.style.setProperty('filter', 'blur(5px)');
            setTimeout(() => {
                document.body.style.removeProperty('filter');
            }, 500);
        };

        // Detectar intentos de impresión (Ctrl+P)
        const handlePrint = (e: Event) => {
            e.preventDefault();
            alert('La impresión y captura de pantalla están deshabilitadas por seguridad.');
            return false;
        };

        // Detectar teclas de captura (PrintScreen, F12, etc.)
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault();
                alert('Las capturas de pantalla están deshabilitadas.');
                return false;
            }
            if (e.shiftKey && e.key === 's' && !e.ctrlKey && !e.altKey) { // Win+Shift+S
                e.preventDefault();
                return false;
            }
            if ((e.ctrlKey && e.shiftKey && e.key === 'I') || e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'C')) {
                e.preventDefault();
                alert('Herramientas de desarrollo deshabilitadas.');
                return false;
            }
        };

        // Detectar si se está ejecutando en un iframe
        if (window.self !== window.top) {
            document.body.innerHTML = '<h1 style="text-align:center; margin-top:20%">Contenido protegido - No se permite embeber</h1>';
        }

        // Agregar event listeners
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('beforeprint', handlePrint);
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup: Muy importante remover todo al desmontar el componente
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('beforeprint', handlePrint);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                input, textarea {
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                    user-select: text !important;
                }

                @media print {
                    * {
                        display: none !important;
                    }
                    body::after {
                        content: "Captura deshabilitada por derechos de autor" !important;
                        display: block !important;
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        font-size: 24px !important;
                        color: red !important;
                    }
                }
            `}} />
            <Watermark />
            {children}
        </>
    );
}