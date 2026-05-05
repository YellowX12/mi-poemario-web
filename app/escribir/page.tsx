import { db } from '../../lib/db';
import { redirect } from 'next/navigation';
import { obtenerSesion } from '../../lib/auth';
import EscribirForm from '../components/EscribirForm';

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

                <EscribirForm error={error} guardarPoema={guardarPoema} />
            </div>
        </main>
    );
}
