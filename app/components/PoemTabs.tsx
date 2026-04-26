'use client';

import { useState, useMemo } from 'react';
import { JWTPayload } from 'jose';
import AuthorFilter from './AuthorFilter';

interface Poema {
    id: number;
    titulo: string;
    contenido: string;
    user_id: number;
    autor?: string;
    likes?: number;
    dislikes?: number;
    comentarios?: number;
}

interface PoemTabsProps {
    poemas: Poema[];
    poemasDestacados: Poema[];
    sesion: JWTPayload | null;
    admin: boolean;
    borrarPoema: (formData: FormData) => Promise<void>;
}

export default function PoemTabs({ poemas, poemasDestacados, sesion, admin, borrarPoema }: PoemTabsProps) {
    const [activeTab, setActiveTab] = useState<'destacados' | 'todos'>('destacados');

    const selectedPoemas = activeTab === 'destacados' ? poemasDestacados : poemas;

    const autores = useMemo(
        () => Array.from(new Set(selectedPoemas.map(p => p.autor || `Usuario ${p.user_id}`))).sort(),
        [selectedPoemas]
    );

    return (
        <div className="page-tabs">
            <div className="tab-list">
                <button
                    type="button"
                    className={`tab-button ${activeTab === 'destacados' ? 'active' : ''}`}
                    onClick={() => setActiveTab('destacados')}
                >
                    Destacados
                </button>
                <button
                    type="button"
                    className={`tab-button ${activeTab === 'todos' ? 'active' : ''}`}
                    onClick={() => setActiveTab('todos')}
                >
                    Todos los poemas
                </button>
            </div>

            <div className="tab-description">
                {activeTab === 'destacados' ? (
                    <p>Explora los poemas más gustados y descubre versos que ya tocaron corazones.</p>
                ) : (
                    <p>Revisa todos los poemas publicados en el poemario y filtra los versos por autor.</p>
                )}
            </div>

            <div className="tab-meta">
                <span>{selectedPoemas.length} poema{selectedPoemas.length === 1 ? '' : 's'}</span>
            </div>

            {selectedPoemas.length === 0 ? (
                <div className="tab-empty">
                    {activeTab === 'destacados' ? (
                        <>
                            <h3>No hay poemas destacados aún</h3>
                            <p>Comparte tus versos para que otros los lean y les den me gusta.</p>
                        </>
                    ) : (
                        <>
                            <h3>No hay poemas publicados aún</h3>
                            <p>Escribe tu primer poema y haz que el poemario crezca.</p>
                        </>
                    )}
                    <div>
                        <button type="button" className="boton boton-primario" onClick={() => window.location.href = '/escribir'}>
                            Escribir un poema
                        </button>
                    </div>
                </div>
            ) : (
                <div className="author-filter-layout">
                    <AuthorFilter
                        poemasData={selectedPoemas}
                        autores={autores}
                        sesion={sesion}
                        admin={admin}
                        borrarPoema={borrarPoema}
                        isHighlighted={false}
                    />
                </div>
            )}
        </div>
    );
}
