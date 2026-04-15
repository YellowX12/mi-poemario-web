'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
    usuario: { id: number; nombre: string; email: string } | null;
}

export default function Navbar({ usuario }: NavbarProps) {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => {
        setMenuAbierto(!menuAbierto);
    };

    const cerrarMenu = () => {
        setMenuAbierto(false);
    };

    return (
        <header className="navbar">
            <div className="navbar-content">
                <Link href="/" className="navbar-logo" onClick={cerrarMenu}>
                    <span className="logo-icon">📖</span>
                    <span className="logo-text">Poemario</span>
                </Link>

                {/* Hamburger Menu */}
                <button 
                    className="hamburger"
                    onClick={toggleMenu}
                    aria-label="Abrir menú"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                {/* Menú Desktop */}
                <nav className="navbar-menu desktop-menu">
                    <Link 
                        href="/" 
                        className={`navbar-link ${pathname === '/' ? 'active' : ''}`}
                    >
                        Poemas
                    </Link>
                    {usuario ? (
                        <>
                            <Link 
                                href="/escribir" 
                                className={`navbar-link ${pathname === '/escribir' ? 'active' : ''}`}
                            >
                                Escribir
                            </Link>
                            <Link 
                                href="/perfil" 
                                className={`navbar-link user-avatar`}
                                title={`${usuario.nombre} (${usuario.email})`}
                            >
                                👤 {usuario.nombre}
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link 
                                href="/login" 
                                className={`navbar-link ${pathname === '/login' ? 'active' : ''}`}
                            >
                                Iniciar sesión
                            </Link>
                            <Link 
                                href="/registro" 
                                className="navbar-link navbar-link-primary"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </nav>

                {/* Menú Mobile */}
                {menuAbierto && (
                    <nav className="navbar-menu mobile-menu">
                        <Link 
                            href="/" 
                            className={`navbar-link ${pathname === '/' ? 'active' : ''}`}
                            onClick={cerrarMenu}
                        >
                            Poemas
                        </Link>
                        {usuario ? (
                            <>
                                <Link 
                                    href="/escribir" 
                                    className={`navbar-link ${pathname === '/escribir' ? 'active' : ''}`}
                                    onClick={cerrarMenu}
                                >
                                    Escribir
                                </Link>
                                <Link 
                                    href="/perfil" 
                                    className="navbar-link user-avatar"
                                    onClick={cerrarMenu}
                                >
                                    👤 {usuario.nombre}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link 
                                    href="/login" 
                                    className={`navbar-link ${pathname === '/login' ? 'active' : ''}`}
                                    onClick={cerrarMenu}
                                >
                                    Iniciar sesión
                                </Link>
                                <Link 
                                    href="/registro" 
                                    className="navbar-link navbar-link-primary"
                                    onClick={cerrarMenu}
                                >
                                    Registrarse
                                </Link>
                            </>
                        )}
                    </nav>
                )}
            </div>
        </header>
    );
}
