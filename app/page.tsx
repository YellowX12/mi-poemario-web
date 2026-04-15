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
}

export default async function Home() {
    const sesion = await obtenerSesion();
    const admin = sesion ? await esAdmin() : false;
    // Siempre obtener el autor con JOIN, tanto con como sin sesión
    const query = 'SELECT p.*, u.nombre as autor FROM poemas p LEFT JOIN usuarios u ON p.user_id = u.id ORDER BY p.id ASC';
    const params: unknown[] = [];

    const [filas] = await db.query(query, params) as [Poema[], unknown];
    const poemas = filas;

    // Obtener lista de autores únicos
    const autoresUnicos = Array.from(
        new Set(poemas.map(p => p.autor || `Usuario ${p.user_id}`))
    ).sort();

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

            <section id="galeria-poemas" className="galeria-poemas">
                {poemas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8a7968' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Aún no hay poemas</h3>
                        <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
                            {sesion ? '¡Sé el primero en compartir tus versos!' : 'Inicia sesión para comenzar a escribir.'}
                        </p>
                        {sesion && (
                            <Link href="/escribir" className="boton boton-primario">Escribir el primer poema</Link>
                        )}
                        {!sesion && (
                            <Link href="/login" className="boton boton-primario">Iniciar sesión</Link>
                        )}
                    </div>
                ) : (
                    <AuthorFilter 
                        poemasData={poemas}
                        autores={autoresUnicos}
                        sesion={sesion}
                        admin={admin}
                        borrarPoema={borrarPoema}
                    />
                )}
            </section>
        </main>
    );
}
