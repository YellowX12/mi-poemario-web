'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface Poema {
    id: number;
    titulo: string;
    contenido: string;
    user_id: number;
    autor?: string;
}

interface AuthorFilterProps {
    poemasData: Poema[];
    autores: string[];
    sesion: any;
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
            <section id="galeria-poemas" className="galeria-poemas">
                {poemasFiltered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8a7968' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>No hay poemas de estos autores</h3>
                        <p style={{ fontSize: '1.1rem' }}>
                            Selecciona otros autores para ver sus poemas
                        </p>
                    </div>
                ) : (
                    poemasFiltered.map((poema) => (
                        <article key={poema.id} className="poema-card">
                            <div className="poema-card-header">
                                <h2 className="titulo-tarjeta">{poema.titulo}</h2>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {sesion && (poema.user_id === parseInt(sesion.userId as string) || admin) && (
                                        <>
                                            <Link href={`/editar/${poema.id}`} className="boton boton-mini">Editar</Link>
                                            <form action={borrarPoema} style={{ display: 'inline' }}>
                                                <input type="hidden" name="id" value={poema.id} />
                                                <button type="submit" className="boton boton-mini" style={{ backgroundColor: '#dc3545' }}>Borrar</button>
                                            </form>
                                        </>
                                    )}
                                    {sesion && poema.user_id !== parseInt(sesion.userId as string) && !admin && (
                                        <span className="boton boton-mini" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Solo {poema.autor || 'el autor'} puede editar</span>
                                    )}
                                    {!sesion && (
                                        <span className="boton boton-mini" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Editar (requiere login)</span>
                                    )}
                                </div>
                            </div>
                            <div className="poema-meta" style={{ fontSize: '0.9rem', color: '#8a7968', marginBottom: '10px' }}>
                                Por: {poema.autor || `Usuario ${poema.user_id}`}
                            </div>
                            <div className="versos">
                                <p className="texto-poema">{poema.contenido}</p>
                            </div>
                        </article>
                    ))
                )}
            </section>
        </>
    );
}
