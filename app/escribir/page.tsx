import { db } from '../../lib/db';
import { redirect } from 'next/navigation';
import { obtenerSesion } from '../../lib/auth';

type EscribirProps = {
    searchParams?: { error?: string };
};

export default async function EscribirPoema({ searchParams }: EscribirProps) {
    const sesion = await obtenerSesion();

    if (!sesion) {
        redirect('/login');
    }

    const params = searchParams ?? {};
    const error = params.error === '1';

    async function guardarPoema(formData: FormData) {
        "use server";
        const titulo = formData.get('titulo')?.toString().trim() ?? '';
        const contenido = formData.get('contenido')?.toString().trim() ?? '';
        const sesion = await obtenerSesion();

        if (!sesion) {
            redirect('/login');
        }

        if (!titulo || !contenido) {
            redirect('/escribir?error=1');
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
                    {error && (
                        <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                            El título y el contenido son obligatorios para publicar.
                        </p>
                    )}
                    <button type="submit">Publicar Poema</button>
                </form>
            </div>
        </main>
    );
}
