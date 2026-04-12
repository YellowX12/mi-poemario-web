import { db } from '../../../lib/db';
import { redirect } from 'next/navigation';
import { obtenerSesion, esAdmin } from '../../../lib/auth';

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
            <header className="portada" style={{ marginBottom: '40px', marginTop: '5vh' }}>
                <h1 className="titulo-poemario">Editar Poema</h1>
                <p className="autor">Modifica tus versos</p>
            </header>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
                <form action={actualizarPoema} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <input 
                        type="text" 
                        name="titulo" 
                        defaultValue={poema.titulo} 
                        required 
                        style={{ padding: '15px', fontSize: '1.2rem', fontFamily: 'inherit', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }}
                    />
                    <textarea 
                        name="contenido" 
                        defaultValue={poema.contenido} 
                        required 
                        rows={15}
                        style={{ padding: '15px', fontSize: '1.2rem', fontFamily: 'inherit', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical', outline: 'none' }}
                    ></textarea>
                    <button 
                        type="submit" 
                        style={{ padding: '15px', fontSize: '1.2rem', backgroundColor: '#222', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.3s' }}
                    >
                        Guardar Cambios
                    </button>
                </form>
                <form action={borrarPoema} style={{ display: 'inline-flex', justifyContent: 'flex-end' }}>
                    <button 
                        type="submit" 
                        style={{ padding: '15px', fontSize: '1.2rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 0.3s' }}
                    >
                        Borrar Poema
                    </button>
                </form>
            </div>
        </main>
    );
}