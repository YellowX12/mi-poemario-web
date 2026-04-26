import { db } from '../lib/db';
import { obtenerSesion, borrarSesion, esAdmin } from '../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AuthorFilter from './components/AuthorFilter';

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

export default async function Home() {
    const sesion = await obtenerSesion();
    const admin = sesion ? await esAdmin() : false;
    
    // Consulta mejorada que cuenta likes, dislikes y comentarios
    const query = `
        SELECT 
            p.*, 
            u.nombre as autor,
            (SELECT COUNT(*) FROM poem_likes WHERE poema_id = p.id AND tipo = 'like') as likes,
            (SELECT COUNT(*) FROM poem_likes WHERE poema_id = p.id AND tipo = 'dislike') as dislikes,
            (SELECT COUNT(*) FROM comentarios WHERE poema_id = p.id) as comentarios
        FROM poemas p 
        LEFT JOIN users u ON p.user_id = u.id 
        ORDER BY likes DESC, p.fecha_creacion DESC
    `;
    const params: unknown[] = [];

    const [filas] = await db.query(query, params) as [Poema[], unknown];
    const poemas = filas;
    
    // Separar poemas destacados (con más de 0 likes)
    const poemasDestacados = poemas.filter(p => (p.likes || 0) > 0);

    async function cerrarSesion() {
        "use server";
        await borrarSesion();
        redirect('/');
    }

    async function borrarPoema(formData: FormData) {
        "use server";
        const id = formData.get('id')?.toString();
        if (!id) return;

        const sesion = await obtenerSesion();
        if (!sesion) return;

        const [poemasCheck] = await db.query('SELECT * FROM poemas WHERE id = ?', [id]) as [Poema[], unknown];
        const poema = poemasCheck[0];
        if (!poema) return;

        const admin = await esAdmin();
        if (poema.user_id !== parseInt(sesion.userId as string) && !admin) return;

        await db.query('DELETE FROM poemas WHERE id = ?', [id]);
        redirect('/');
    }

    return (
        <main className="contenedor">
            <header className="portada">
                <div className="hero">
                    <div className="hero-text">
                        <p className="hero-subtitle">Mi Poemario</p>
                        <h1 className="titulo-poemario">Tu colección de versos íntimos</h1>
                        <p className="autor">Explora poemas hechos con calma, siente la voz detrás de cada línea.</p>
                    </div>

                    <div className="hero-actions">
                        {sesion ? (
                            <>
                                <Link href="/escribir" className="boton boton-primario">Escribir un poema</Link>
                                <form action={cerrarSesion} className="hero-action-form">
                                    <button type="submit" className="boton boton-secundario">Cerrar sesión</button>
                                </form>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="boton boton-primario">Iniciar sesión</Link>
                                <Link href="/registro" className="boton boton-secundario">Registrarme</Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <section id="poemas-destacados" className="galeria-poemas">
                <h2 className="seccion-titulo">Poemas más gustados</h2>
                {poemasDestacados.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8a7968' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Aún no hay poemas gustados</h3>
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            {sesion ? 'Aún no hay likes en los poemas. ¡Comparte tu verso!' : 'Inicia sesión para ver los poemas más gustados.'}
                        </p>
                        {sesion && (
                            <Link href="/escribir" className="boton boton-primario">Escribir un poema</Link>
                        )}
                        {!sesion && (
                            <Link href="/login" className="boton boton-primario">Iniciar sesión</Link>
                        )}
                    </div>
                ) : (
                    <div className="author-filter-layout">
                        <AuthorFilter 
                            poemasData={poemasDestacados}
                            autores={Array.from(new Set(poemasDestacados.map(p => p.autor || `Usuario ${p.user_id}`))).sort()}
                            sesion={sesion}
                            admin={admin}
                            borrarPoema={borrarPoema}
                            isHighlighted={false}
                        />
                    </div>
                )}
            </section>

            <section id="todos-los-poemas" className="galeria-poemas">
                <h2 className="seccion-titulo">Todos los poemas</h2>
                {poemas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8a7968' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Aún no hay poemas publicados</h3>
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            Publica tu primer poema para que otros puedan leerlo.
                        </p>
                        {sesion ? (
                            <Link href="/escribir" className="boton boton-primario">Escribir un poema</Link>
                        ) : (
                            <Link href="/login" className="boton boton-primario">Iniciar sesión</Link>
                        )}
                    </div>
                ) : (
                    <div className="author-filter-layout">
                        <AuthorFilter 
                            poemasData={poemas}
                            autores={Array.from(new Set(poemas.map(p => p.autor || `Usuario ${p.user_id}`))).sort()}
                            sesion={sesion}
                            admin={admin}
                            borrarPoema={borrarPoema}
                            isHighlighted={false}
                        />
                    </div>
                )}
            </section>
        </main>
    );
}
