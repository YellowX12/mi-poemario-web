'use client';

import { useEffect } from 'react';
import Watermark from './Watermark';

export default function SecurityProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Bloquear getDisplayMedia (compartir pantalla/grabación)
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia = (() => {
                throw new Error('Screen capture is disabled.');
            }) as any;
        }

        // Bloquear getScreenDetails (API de pantalla)
        if ((navigator as any).getScreenDetails) {
            (navigator as any).getScreenDetails = (() => {
                throw new Error('Screen details are disabled.');
            }) as any;
        }

        // Bloquear acceso a clipboard
        if (navigator.clipboard) {
            navigator.clipboard.readText = (() => {
                return Promise.reject(new Error('Clipboard access denied.'));
            }) as any;
            navigator.clipboard.writeText = (() => {
                return Promise.reject(new Error('Clipboard access denied.'));
            }) as any;
        }

        // Prevenir copiar/pegar/cortar
        const preventCopyPaste = (e: Event) => {
            e.preventDefault();
            return false;
        };

        // Prevenir menú contextual
        const preventContextMenu = (e: Event) => {
            e.preventDefault();
            return false;
        };

        // Detectar intentos de captura de pantalla
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Usuario cambió de pestaña o intentó capturar
                document.body.style.filter = 'blur(10px)';
                document.body.style.pointerEvents = 'none';
                setTimeout(() => {
                    document.body.style.filter = '';
                    document.body.style.pointerEvents = '';
                }, 1000);
            }
        };

        // Detectar pérdida de foco (posible captura)
        const handleBlur = () => {
            document.body.style.filter = 'blur(5px)';
            setTimeout(() => {
                document.body.style.filter = '';
            }, 500);
        };

        // Detectar intentos de impresión (posible captura)
        const handlePrint = (e: Event) => {
            e.preventDefault();
            alert('La captura de pantalla está deshabilitada por seguridad.');
            return false;
        };

        // Detectar teclas de captura (PrintScreen, etc.)
        const handleKeyDown = (e: KeyboardEvent) => {
            // Prevenir PrintScreen
            if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'p')) {
                e.preventDefault();
                alert('Capturas de pantalla están deshabilitadas.');
                return false;
            }

            // Prevenir Win+Shift+S (Windows 10+ screenshot)
            if (e.shiftKey && e.key === 's' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                return false;
            }

            // Prevenir Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                alert('Herramientas de desarrollo deshabilitadas.');
                return false;
            }

            // Prevenir F12
            if (e.key === 'F12') {
                e.preventDefault();
                alert('Herramientas de desarrollo deshabilitadas.');
                return false;
            }

            // Prevenir Ctrl+Shift+C (DevTools Inspector)
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                return false;
            }
        };

        // Detectar cambios en el viewport (posible captura)
        const handleResize = () => {
            if (window.innerWidth < 300 || window.innerHeight < 300) {
                document.body.style.filter = 'blur(20px)';
                document.body.style.pointerEvents = 'none';
                alert('Actividad sospechosa detectada. La página se ha protegido.');
            }
        };

        // Detectar si se está ejecutando en un iframe
        if (window.self !== window.top) {
            document.body.innerHTML = '<h1>Contenido protegido - No se permite embeber</h1>';
        }

        // Prevenir screenshots con CSS tricks
        const style = document.createElement('style');
        style.textContent = `
            * {
                -webkit-backface-visibility: hidden !important;
                backface-visibility: hidden !important;
            }
            body {
                background-attachment: fixed !important;
            }
        `;
        document.head.appendChild(style);

        // Agregar event listeners
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);
        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('blur', handleBlur);
        window.addEventListener('beforeprint', handlePrint);
        document.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);

        // Prevenir selección de texto
        document.body.style.userSelect = 'none';
        (document.body.style as any).webkitUserSelect = 'none';
        (document.body.style as any).msUserSelect = 'none';

        // Prevenir arrastrar elementos
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });

        // Cleanup
        return () => {
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('blur', handleBlur);
            window.removeEventListener('beforeprint', handlePrint);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <>
            <style jsx global>{`
                * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                }

                /* Permitir selección en inputs y textareas */
                input, textarea {
                    -webkit-user-select: text !important;
                    -moz-user-select: text !important;
                    -ms-user-select: text !important;
                    user-select: text !important;
                }

                /* Prevenir capturas */
                @media print {
                    * {
                        display: none !important;
                    }
                    body::after {
                        content: "Captura deshabilitada" !important;
                        display: block !important;
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        font-size: 24px !important;
                        color: red !important;
                    }
                }
            `}</style>
            <Watermark />
            {children}
        </>
    );
}