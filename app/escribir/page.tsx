import { db } from '../../lib/db';
import { redirect } from 'next/navigation';
import { obtenerSesion } from '../../lib/auth';

export default async function EscribirPoema() {
    const sesion = await obtenerSesion();

    if (!sesion) {
        redirect('/login');
    }

    async function guardarPoema(formData: FormData) {
        "use server";
        const titulo = formData.get('titulo');
        const contenido = formData.get('contenido');
        const sesion = await obtenerSesion();

        if (!sesion) {
            redirect('/login');
        }

        await db.query(
            'INSERT INTO poemas (titulo, contenido, user_id) VALUES (?, ?, ?)',
            [titulo, contenido, parseInt(sesion.userId as string)]
        );

        redirect('/');
    }

    return (
        <main className="contenedor">
            <div className="page-card">
                <header className="page-header">
                    <div>
                        <h1 className="titulo-poemario">Panel de Escritor</h1>
                        <p className="autor">Inmortaliza tus versos con un diseño claro y agradable.</p>
                    </div>
                </header>

                <form action={guardarPoema} className="formulario-auth">
                    <input
                        type="text"
                        name="titulo"
                        placeholder="Título del poema"
                        required
                    />
                    <textarea
                        name="contenido"
                        placeholder="Escribe aquí... (Puedes usar enter libremente)"
                        required
                        rows={15}
                    />
                    <button type="submit">Publicar Poema</button>
                </form>
            </div>
        </main>
    );
}
