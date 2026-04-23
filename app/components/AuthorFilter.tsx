'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

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

import { JWTPayload } from 'jose';

interface AuthorFilterProps {
    poemasData: Poema[];
    autores: string[];
    sesion: JWTPayload | null;
    admin: boolean;
    borrarPoema: (formData: FormData) => Promise<void>;
}

export default function AuthorFilter({ 
    poemasData, 
    autores, 
    sesion, 
    admin, 
    borrarPoema 
}: AuthorFilterProps) {
    const [autorSelected, setAutorSelected] = useState<Set<string>>(new Set(autores));
    const [expandedPoems, setExpandedPoems] = useState<Set<number>>(new Set());
    const [favorites, setFavorites] = useState<Set<number>>(new Set()); // Simulado, en BD sería por usuario

    const poemasFiltered = useMemo(() => {
        if (autorSelected.size === 0) return [];
        return poemasData.filter(poema => {
            const autorDisplay = poema.autor || `Usuario ${poema.user_id}`;
            return autorSelected.has(autorDisplay);
        });
    }, [autorSelected, poemasData]);

    const handleAutorChange = (autor: string, checked: boolean) => {
        const newSelected = new Set(autorSelected);
        if (checked) {
            newSelected.add(autor);
        } else {
            newSelected.delete(autor);
        }
        setAutorSelected(newSelected);
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setAutorSelected(new Set(autores));
        } else {
            setAutorSelected(new Set());
        }
    };

    const toggleExpand = (poemaId: number) => {
        const newExpanded = new Set(expandedPoems);
        if (newExpanded.has(poemaId)) {
            newExpanded.delete(poemaId);
        } else {
            newExpanded.add(poemaId);
        }
        setExpandedPoems(newExpanded);
    };

    const toggleFavorite = (poemaId: number) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(poemaId)) {
            newFavorites.delete(poemaId);
        } else {
            newFavorites.add(poemaId);
        }
        setFavorites(newFavorites);
    };

    const truncateContent = (content: string, lines: number = 5) => {
        const linesArray = content.split('\n');
        if (linesArray.length <= lines) return content;
        return linesArray.slice(0, lines).join('\n') + '\n...';
    };

    return (
        <>
            {/* Filtro de Autores */}
            <div className="author-filter">
                <div className="filter-header">
                    <h3>Filtrar por Autor</h3>
                    <button 
                        className="filter-toggle-all"
                        onClick={() => toggleSelectAll(autorSelected.size !== autores.length)}
                    >
                        {autorSelected.size === autores.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                </div>

                <div className="filter-options">
                    {autores.map((autor) => (
                        <label key={autor} className="filter-option">
                            <input
                                type="checkbox"
                                checked={autorSelected.has(autor)}
                                onChange={(e) => handleAutorChange(autor, e.target.checked)}
                            />
                            <span>{autor}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Galería de Poemas Filtrados */}
            <section id="galeria-poemas" className="galeria-poemas" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {poemasFiltered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8a7968', gridColumn: '1 / -1' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No hay poemas de estos autores</h3>
                        <p style={{ fontSize: '1.1rem' }}>
                            Selecciona otros autores para ver sus poemas
                        </p>
                    </div>
                ) : (
                    poemasFiltered.map((poema) => {
                        const isExpanded = expandedPoems.has(poema.id);
                        const isFavorite = favorites.has(poema.id);
                        const contentToShow = isExpanded ? poema.contenido : truncateContent(poema.contenido, 5);
                        const needsTruncation = poema.contenido.split('\n').length > 5;

                        return (
                            <article key={poema.id} className="poema-card" style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
                                <div className="poema-card-header">
                                    <h2 className="titulo-tarjeta">{poema.titulo}</h2>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {(() => {
                                            const userId = sesion?.userId as string;
                                            return sesion && userId && (poema.user_id === parseInt(userId) || admin) && (
                                                <>
                                                    <Link href={`/editar/${poema.id}`} className="boton boton-mini">Editar</Link>
                                                    <form action={borrarPoema} style={{ display: 'inline' }}>
                                                        <input type="hidden" name="id" value={poema.id} />
                                                        <button type="submit" className="boton boton-mini" style={{ backgroundColor: '#dc3545' }}>Borrar</button>
                                                    </form>
                                                </>
                                            );
                                        })()}
                                        {(() => {
                                            const userId = sesion?.userId as string;
                                            return sesion && userId && poema.user_id !== parseInt(userId) && !admin && (
                                                <span className="boton boton-mini" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Solo {poema.autor || 'el autor'} puede editar</span>
                                            );
                                        })()}
                                        {!sesion && (
                                            <span className="boton boton-mini" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Editar (requiere login)</span>
                                        )}
                                    </div>
                                </div>
                                <div className="poema-meta" style={{ fontSize: '0.9rem', color: '#8a7968', marginBottom: '10px' }}>
                                    Por: {poema.autor || `Usuario ${poema.user_id}`}
                                </div>
                                <div className="versos">
                                    <p className="texto-poema" style={{ whiteSpace: 'pre-line' }}>{contentToShow}</p>
                                    {needsTruncation && (
                                        <button 
                                            onClick={() => toggleExpand(poema.id)}
                                            className="boton boton-mini"
                                            style={{ marginTop: '10px' }}
                                        >
                                            {isExpanded ? 'Leer menos' : 'Leer más'}
                                        </button>
                                    )}
                                </div>
                                <div className="poema-actions" style={{ marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button className="boton boton-mini" style={{ backgroundColor: '#28a745' }}>
                                        👍 {poema.likes || 0}
                                    </button>
                                    <button className="boton boton-mini" style={{ backgroundColor: '#dc3545' }}>
                                        👎 {poema.dislikes || 0}
                                    </button>
                                    <button 
                                        onClick={() => toggleFavorite(poema.id)}
                                        className="boton boton-mini"
                                        style={{ backgroundColor: isFavorite ? '#ffc107' : '#6c757d' }}
                                    >
                                        {isFavorite ? '⭐ Favorito' : '☆ Agregar a favoritos'}
                                    </button>
                                    <span className="boton boton-mini" style={{ opacity: 0.7 }}>
                                        💬 Comentarios ({poema.comentarios || 0})
                                    </span>
                                </div>
                                <div className="comentarios" style={{ marginTop: '15px' }}>
                                    <h4>Comentarios</h4>
                                    <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                                        {/* Aquí irían los comentarios reales */}
                                        <p style={{ fontStyle: 'italic', color: '#888' }}>Comentarios próximamente...</p>
                                    </div>
                                    {sesion && (
                                        <form style={{ marginTop: '10px' }}>
                                            <textarea placeholder="Escribe un comentario..." rows={2} style={{ width: '100%', border: '1px solid #ddd', borderRadius: '4px', padding: '5px' }}></textarea>
                                            <button type="submit" className="boton boton-mini" style={{ marginTop: '5px' }}>Comentar</button>
                                        </form>
                                    )}
                                </div>
                            </article>
                        );
                    })
                )}
            </section>
        </>
    );
}
