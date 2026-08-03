import { db } from '../../../lib/db';
import { redirect } from 'next/navigation';
import { obtenerSesion, esAdmin } from '../../../lib/auth';
import ModoNocheToggle from '../../components/ModoNocheToggle';

interface Poema {
    id: number;
    titulo: string;
    contenido: string;
    user_id: number;
}

export default async function EditarPoema({ params }: { params: Promise<{ id: string }> }) {
    // 1. Validamos que seas tú (que tengas sesión)
    const sesion = await obtenerSesion();
    if (!sesion) {
        redirect('/login');
    }

    // 2. Extraemos el número (ID) del poema que queremos editar
    const { id } = await params;

    // 3. Buscamos ese poema específico en la base de datos
    const [filas] = await db.query('SELECT * FROM poemas WHERE id = ?', [id]) as [Poema[], unknown];
    const poema = filas[0];

    // Si el poema no existe, te regresa a la portada
    if (!poema) {
        redirect('/');
    }

    // 4. Verificamos que el poema pertenezca al usuario actual o que sea admin
    const admin = await esAdmin();
    if (poema.user_id !== parseInt(sesion.userId as string) && !admin) {
        redirect('/');
    }

    // 4. Esta función guardará los CAMBIOS en la base de datos
    async function actualizarPoema(formData: FormData) {
        "use server";
        const titulo = formData.get('titulo')?.toString() ?? '';
        const contenido = formData.get('contenido')?.toString() ?? '';

        if (!titulo || !contenido) {
            redirect(`/editar/${id}`);
            return;
        }

        const sesion = await obtenerSesion();
        if (!sesion) {
            redirect('/login');
        }

        // Verificar permisos
        const admin = await esAdmin();
        if (poema.user_id !== parseInt(sesion.userId as string) && !admin) {
            redirect('/');
        }

        // Usamos UPDATE en lugar de INSERT INTO
        await db.query(
            'UPDATE poemas SET titulo = ?, contenido = ? WHERE id = ?', 
            [titulo, contenido, id]
        );

        redirect('/');
    }

    async function borrarPoema() {
        "use server";
        const sesion = await obtenerSesion();
        if (!sesion) return;

        const admin = await esAdmin();
        if (poema.user_id !== parseInt(sesion.userId as string) && !admin) return;

        await db.query('DELETE FROM poemas WHERE id = ?', [id]);
        redirect('/');
    }

    // Usamos defaultValue para que los cuadros de texto aparezcan pre-llenados con tu poema
    return (
        <main className="contenedor">
            <ModoNocheToggle />

            <section className="editor-card">
                <header className="editor-header">
                    <div>
                        <h1 className="titulo-poemario">Editar Poema</h1>
                        <p className="autor">Modifica tus versos y dale ritmo a tus líneas.</p>
                    </div>
                    <p className="nota-accesible">Un espacio limpio y cálido para leer y escribir.</p>
                </header>

                <div className="editor-body">
                    <form action={actualizarPoema} className="editor-form">
                        <label className="form-label">
                            <span>Título</span>
                            <input
                                type="text"
                                name="titulo"
                                defaultValue={poema.titulo}
                                required
                                className="input-text"
                            />
                        </label>

                        <label className="form-label">
                            <span>Contenido</span>
                            <textarea
                                name="contenido"
                                defaultValue={poema.contenido}
                                required
                                rows={14}
                                className="textarea-content"
                            />
                        </label>

                        <div className="editor-actions">
                            <button type="submit" className="boton boton-primario boton-guardar">
                                Guardar cambios
                            </button>
                        </div>
                    </form>

                    <form action={borrarPoema} className="borrar-form">
                        <button type="submit" className="boton boton-secundario boton-borrar">
                            Borrar poema
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}