'use client';

// 1. Importamos ReactNode aquí arriba
import { useEffect, ReactNode } from 'react';
import Watermark from './Watermark';

// 2. Usamos ReactNode directamente
export default function SecurityProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        // Bloquear getDisplayMedia (compartir pantalla/grabación)
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia = (() => {
                return Promise.reject(new Error('Screen capture is disabled.'));
            }) as any;
        }

        // Bloquear getScreenDetails (API de pantalla)
        if ((navigator as any).getScreenDetails) {
            (navigator as any).getScreenDetails = (() => {
                return Promise.reject(new Error('Screen details are disabled.'));
            }) as any;
        }

        // Bloquear acceso a clipboard
        if (navigator.clipboard) {
            navigator.clipboard.readText = (() => Promise.reject(new Error('Clipboard access denied.'))) as any;
            navigator.clipboard.writeText = (() => Promise.reject(new Error('Clipboard access denied.'))) as any;
        }

        // Prevenir copiar/pegar/cortar
        const preventCopyPaste = (e: Event) => {
            e.preventDefault();
            return false;
        };

        // Prevenir menú contextual (clic derecho)
        const preventContextMenu = (e: Event) => {
            e.preventDefault();
            return false;
        };

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

        // Prevenir arrastrar elementos (imágenes/texto)
        const preventDrag = (e: Event) => {
            e.preventDefault();
            return false;
        };

        // Prevenir screenshots con CSS tricks (inyectado dinámicamente)
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

        // Prevenir selección de texto vía JS
        document.body.style.userSelect = 'none';
        (document.body.style as any).webkitUserSelect = 'none';
        (document.body.style as any).msUserSelect = 'none';

        // Agregar event listeners
        document.addEventListener('copy', preventCopyPaste);
        document.addEventListener('paste', preventCopyPaste);
        document.addEventListener('cut', preventCopyPaste);
        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur); 
        window.addEventListener('beforeprint', handlePrint);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('dragstart', preventDrag);

        // Cleanup: Muy importante remover todo al desmontar el componente
        return () => {
            document.removeEventListener('copy', preventCopyPaste);
            document.removeEventListener('paste', preventCopyPaste);
            document.removeEventListener('cut', preventCopyPaste);
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('beforeprint', handlePrint);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('dragstart', preventDrag);
            
            // Remover el estilo inyectado para evitar fugas de memoria
            if (document.head.contains(style)) {
                document.head.removeChild(style);
            }
        };
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    -webkit-touch-callout: none !important;
                }

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