'use client';

import { useState, useMemo, useEffect } from 'react';
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

interface Comentario {
    id: number;
    contenido: string;
    fecha: string;
    autor: string;
}

import { JWTPayload } from 'jose';

interface AuthorFilterProps {
    poemasData: Poema[];
    autores: string[];
    sesion: JWTPayload | null;
    admin: boolean;
    borrarPoema: (formData: FormData) => Promise<void>;
    isHighlighted?: boolean;
}

export default function AuthorFilter({ 
    poemasData, 
    autores, 
    sesion, 
    admin, 
    borrarPoema,
    isHighlighted = false
}: AuthorFilterProps) {
    const [autorSelected, setAutorSelected] = useState<Set<string>>(new Set(autores));
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedPoems, setExpandedPoems] = useState<Set<number>>(new Set());
    const [favorites, setFavorites] = useState<Set<number>>(new Set());
    const [userLikes, setUserLikes] = useState<Map<number, string>>(new Map());
    const [comentariosMap, setComentariosMap] = useState<Map<number, Comentario[]>>(new Map());
    const [nuevoComentario, setNuevoComentario] = useState<Map<number, string>>(new Map());
    const [loadingLikes, setLoadingLikes] = useState<Set<number>>(new Set());
    const [poemasActualizados, setPoemasActualizados] = useState<Map<number, Poema>>(new Map());

    // Cargar comentarios al iniciar
    useEffect(() => {
        const cargarComentarios = async () => {
            const newMap = new Map<number, Comentario[]>();
            for (const poema of poemasData) {
                try {
                    const res = await fetch(`/api/comentarios?poemaId=${poema.id}`);
                    if (res.ok) {
                        const comentarios = await res.json();
                        newMap.set(poema.id, comentarios);
                    }
                } catch (error) {
                    console.error('Error cargando comentarios:', error);
                }
            }
            setComentariosMap(newMap);
        };

        cargarComentarios();
    }, [poemasData]);

    const poemasFiltered = useMemo(() => {
        if (autorSelected.size === 0) return [];

        const search = searchTerm.trim().toLowerCase();
        return poemasData.filter(poema => {
            const autorDisplay = poema.autor || `Usuario ${poema.user_id}`;
            const matchesAutor = autorSelected.has(autorDisplay);
            const matchesSearch = !search ||
                poema.titulo.toLowerCase().includes(search) ||
                poema.contenido.toLowerCase().includes(search);

            return matchesAutor && matchesSearch;
        });
    }, [autorSelected, poemasData, searchTerm]);

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

    const handleLike = async (poemaId: number, tipo: 'like' | 'dislike') => {
        if (!sesion) {
            alert('Debes iniciar sesión');
            return;
        }

        setLoadingLikes(prev => new Set(prev).add(poemaId));

        try {
            const res = await fetch('/api/likes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ poemaId, tipo })
            });

            if (res.ok) {
                const data = await res.json();
                const currentType = userLikes.get(poemaId);
                
                // Actualizar el mapa de likes del usuario
                if (data.action === 'removed') {
                    userLikes.delete(poemaId);
                } else {
                    userLikes.set(poemaId, tipo);
                }
                setUserLikes(new Map(userLikes));

                // Actualizar contador en poemasActualizados
                const poemaActual = poemasActualizados.get(poemaId) || 
                    poemasData.find(p => p.id === poemaId) ||
                    { ...poemasData[0] };

                if (data.action === 'removed') {
                    if (tipo === 'like') poemaActual.likes = (poemaActual.likes || 0) - 1;
                    if (tipo === 'dislike') poemaActual.dislikes = (poemaActual.dislikes || 0) - 1;
                } else if (data.action === 'added') {
                    if (tipo === 'like') poemaActual.likes = (poemaActual.likes || 0) + 1;
                    if (tipo === 'dislike') poemaActual.dislikes = (poemaActual.dislikes || 0) + 1;
                } else if (data.action === 'updated') {
                    if (currentType === 'like') poemaActual.likes = (poemaActual.likes || 0) - 1;
                    if (currentType === 'dislike') poemaActual.dislikes = (poemaActual.dislikes || 0) - 1;
                    if (tipo === 'like') poemaActual.likes = (poemaActual.likes || 0) + 1;
                    if (tipo === 'dislike') poemaActual.dislikes = (poemaActual.dislikes || 0) + 1;
                }

                poemasActualizados.set(poemaId, poemaActual);
                setPoemasActualizados(new Map(poemasActualizados));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al registrar el like');
        } finally {
            setLoadingLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(poemaId);
                return newSet;
            });
        }
    };

    const handleAgregarComentario = async (poemaId: number) => {
        const contenido = nuevoComentario.get(poemaId) || '';
        if (!contenido.trim()) {
            alert('Escribe un comentario');
            return;
        }

        try {
            const res = await fetch('/api/comentarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ poemaId, contenido })
            });

            if (res.ok) {
                // Recargar comentarios
                const resComents = await fetch(`/api/comentarios?poemaId=${poemaId}`);
                if (resComents.ok) {
                    const comentarios = await resComents.json();
                    comentariosMap.set(poemaId, comentarios);
                    setComentariosMap(new Map(comentariosMap));
                }
                
                // Limpiar input
                nuevoComentario.delete(poemaId);
                setNuevoComentario(new Map(nuevoComentario));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar comentario');
        }
    };

    const truncateContent = (content: string, lines: number = 5) => {
        const linesArray = content.split('\n');
        if (linesArray.length <= lines) return content;
        return linesArray.slice(0, lines).join('\n') + '\n...';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    // Obtener poema actualizado o original
    const getPoema = (poemaId: number) => {
        return poemasActualizados.get(poemaId) || poemasData.find(p => p.id === poemaId)!;
    };

    if (!isHighlighted) {
        return (
            <div className="author-filter-layout">
                <div className="author-filter">
                    <div className="filter-header">
                        <div>
                            <h3>Filtrar por Autor</h3>
                            <p className="filter-summary">{poemasFiltered.length} poema{poemasFiltered.length === 1 ? '' : 's'} encontrados</p>
                        </div>
                        <button 
                            className="filter-toggle-all"
                            onClick={() => toggleSelectAll(autorSelected.size !== autores.length)}
                        >
                            {autorSelected.size === autores.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </button>
                    </div>

                    <div className="filter-search">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por título o verso"
                        />
                        <button
                            type="button"
                            className="filter-clear"
                            onClick={() => setSearchTerm('')}
                        >
                            Limpiar
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

                {/* Galería de Poemas */}
                <section className="galeria-poemas-grid">
                    {poemasFiltered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#8a7968', gridColumn: '1 / -1' }}>
                            <p>No hay poemas de estos autores</p>
                        </div>
                    ) : (
                        poemasFiltered.map((poemaOriginal) => {
                            const poema = getPoema(poemaOriginal.id);
                            const isExpanded = expandedPoems.has(poema.id);
                            const isFavorite = favorites.has(poema.id);
                            const contentToShow = isExpanded ? poema.contenido : truncateContent(poema.contenido, 5);
                            const needsTruncation = poema.contenido.split('\n').length > 5;
                            const userLikeType = userLikes.get(poema.id);
                            const isLoadingLike = loadingLikes.has(poema.id);

                            return (
                                <article key={poema.id} className="poema-card">
                                    <div className="poema-card-header">
                                        <h2 className="titulo-tarjeta">{poema.titulo}</h2>
                                    </div>
                                    
                                    <div className="poema-meta">
                                        Por: <strong>{poema.autor || `Usuario ${poema.user_id}`}</strong>
                                    </div>

                                    <div className="versos">
                                        <p className="texto-poema">{contentToShow}</p>
                                        {needsTruncation && (
                                            <button
                                                onClick={() => toggleExpand(poema.id)}
                                                className="boton-enlace"
                                            >
                                                {isExpanded ? 'Leer menos' : 'Leer más'}
                                            </button>
                                        )}
                                    </div>

                                    {/* Botones de edición */}
                                    {(() => {
                                        const userId = sesion?.userId as string;
                                        return sesion && userId && (poema.user_id === parseInt(userId) || admin) && (
                                            <div className="poema-edit-buttons">
                                                <Link href={`/editar/${poema.id}`} className="boton boton-mini">Editar</Link>
                                                <form action={borrarPoema} style={{ display: 'inline' }}>
                                                    <input type="hidden" name="id" value={poema.id} />
                                                    <button type="submit" className="boton boton-mini boton-peligro">Borrar</button>
                                                </form>
                                            </div>
                                        );
                                    })()}

                                    {/* Acciones */}
                                    <div className="poema-actions">
                                        <button 
                                            className={`action-btn ${userLikeType === 'like' ? 'active' : ''}`}
                                            onClick={() => handleLike(poema.id, 'like')}
                                            disabled={isLoadingLike || !sesion}
                                            title={!sesion ? 'Inicia sesión para dar like' : ''}
                                        >
                                            👍 <span>{poema.likes || 0}</span>
                                        </button>
                                        <button 
                                            className={`action-btn ${userLikeType === 'dislike' ? 'active' : ''}`}
                                            onClick={() => handleLike(poema.id, 'dislike')}
                                            disabled={isLoadingLike || !sesion}
                                            title={!sesion ? 'Inicia sesión para dar dislike' : ''}
                                        >
                                            👎 <span>{poema.dislikes || 0}</span>
                                        </button>
                                        <button 
                                            className={`action-btn ${isFavorite ? 'active' : ''}`}
                                            onClick={() => toggleFavorite(poema.id)}
                                        >
                                            {isFavorite ? '⭐' : '☆'} <span>Favorito</span>
                                        </button>
                                    </div>

                                    {/* Comentarios */}
                                    <div className="comentarios-section">
                                        <h4>Comentarios ({comentariosMap.get(poema.id)?.length || 0})</h4>
                                        <div className="comentarios-lista">
                                            {(comentariosMap.get(poema.id) || []).map(com => (
                                                <div key={com.id} className="comentario-item">
                                                    <div className="comentario-header">
                                                        <strong>{com.autor}</strong>
                                                        <span className="comentario-fecha">{formatDate(com.fecha)}</span>
                                                    </div>
                                                    <p className="comentario-texto">{com.contenido}</p>
                                                </div>
                                            ))}
                                            {(comentariosMap.get(poema.id) === undefined || (comentariosMap.get(poema.id)?.length || 0) === 0) && (
                                                <p style={{ fontStyle: 'italic', color: '#999', fontSize: '0.9rem' }}>Sin comentarios aún</p>
                                            )}
                                        </div>

                                        {sesion && (
                                            <div className="comentario-input-form">
                                                <textarea 
                                                    placeholder="Escribe un comentario..."
                                                    rows={2}
                                                    value={nuevoComentario.get(poema.id) || ''}
                                                    onChange={(e) => {
                                                        nuevoComentario.set(poema.id, e.target.value);
                                                        setNuevoComentario(new Map(nuevoComentario));
                                                    }}
                                                />
                                                <button 
                                                    type="button"
                                                    className="boton boton-mini"
                                                    onClick={() => handleAgregarComentario(poema.id)}
                                                >
                                                    Comentar
                                                </button>
                                            </div>
                                        )}
                                        {!sesion && (
                                            <p style={{ fontSize: '0.9rem', color: '#8a7968', marginTop: '10px' }}>
                                                <Link href="/login" className="boton-enlace">Inicia sesión</Link> para comentar
                                            </p>
                                        )}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </section>
            </div>
        );
    }

    // Versión simplificada para poemas destacados
    return (
        <section className="galeria-poemas-grid galeria-destacada">
            {poemasData.map((poemaOriginal) => {
                const poema = getPoema(poemaOriginal.id);
                const isExpanded = expandedPoems.has(poema.id);
                const isFavorite = favorites.has(poema.id);
                const contentToShow = isExpanded ? poema.contenido : truncateContent(poema.contenido, 4);
                const needsTruncation = poema.contenido.split('\n').length > 4;
                const userLikeType = userLikes.get(poema.id);

                return (
                    <article key={poema.id} className="poema-card poema-card-destacado">
                        <div className="poema-highlight-badge">⭐ {poema.likes} me gusta</div>
                        
                        <h2 className="titulo-tarjeta">{poema.titulo}</h2>
                        
                        <div className="poema-meta">
                            Por: <strong>{poema.autor || `Usuario ${poema.user_id}`}</strong>
                        </div>

                        <div className="versos">
                            <p className="texto-poema">{contentToShow}</p>
                            {needsTruncation && (
                                <button
                                    onClick={() => toggleExpand(poema.id)}
                                    className="boton-enlace"
                                >
                                    {isExpanded ? 'Leer menos' : 'Leer más'}
                                </button>
                            )}
                        </div>

                        <div className="poema-actions-compact">
                            <button 
                                className={`action-btn-small ${userLikeType === 'like' ? 'active' : ''}`}
                                onClick={() => handleLike(poema.id, 'like')}
                                disabled={!sesion}
                            >
                                👍 {poema.likes || 0}
                            </button>
                            <button 
                                className={`action-btn-small ${isFavorite ? 'active' : ''}`}
                                onClick={() => toggleFavorite(poema.id)}
                            >
                                {isFavorite ? '⭐' : '☆'}
                            </button>
                            <button 
                                className="action-btn-small"
                            >
                                💬 {comentariosMap.get(poema.id)?.length || 0}
                            </button>
                        </div>
                    </article>
                );
            })}
        </section>
    );
}
