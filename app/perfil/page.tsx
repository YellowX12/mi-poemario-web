import { db } from '../../lib/db';
import { obtenerUsuario } from '../../lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RowDataPacket } from 'mysql2';

type Usuario = RowDataPacket & { id: number; nombre: string; email: string; password: string };

type PerfilProps = {
    searchParams?: { error?: string; success?: string };
};

export default async function Perfil({ searchParams }: PerfilProps) {
    const params = searchParams ?? {};
    const error = params.error;
    const success = params.success === '1';

    const usuario = await obtenerUsuario();
    if (!usuario) {
        redirect('/login');
    }

    async function actualizarPerfil(formData: FormData) {
        "use server";
        const nombre = formData.get('nombre')?.toString().trim() ?? '';
        const email = formData.get('email')?.toString().trim() ?? '';
        const passActual = formData.get('password_actual')?.toString() ?? '';
        const passNueva = formData.get('password_nueva')?.toString() ?? '';
        const passConfirm = formData.get('password_confirm')?.toString() ?? '';

        const sesionUsuario = await obtenerUsuario();
        if (!sesionUsuario) {
            redirect('/login');
        }

        if (!nombre || !email) {
            redirect('/perfil?error=2');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            redirect('/perfil?error=3');
        }

        // Verificar si el email ya existe (si cambió)
        if (email !== sesionUsuario.email) {
            const [existing] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, sesionUsuario.id]) as [{ id: number }[], unknown];
            if (existing.length > 0) {
                redirect('/perfil?error=1');
            }
        }

        // Si se quiere cambiar contraseña
        if (passNueva) {
            if (!passActual) {
                redirect('/perfil?error=4');
            }

            // Verificar contraseña actual
            const [userDb] = await db.query<Usuario[]>('SELECT password FROM users WHERE id = ?', [sesionUsuario.id]);
            const user = userDb[0];
            if (!user || !await bcrypt.compare(passActual, user.password)) {
                redirect('/perfil?error=5');
            }

            // Verificar que las nuevas coincidan
            if (passNueva !== passConfirm) {
                redirect('/perfil?error=6');
            }

            // Encriptar nueva contraseña
            const hashedNueva = await bcrypt.hash(passNueva, 10);

            await db.query(
                'UPDATE users SET nombre = ?, email = ?, password = ? WHERE id = ?',
                [nombre, email, hashedNueva, sesionUsuario.id]
            );
        } else {
            // Solo actualizar nombre y email
            await db.query(
                'UPDATE users SET nombre = ?, email = ? WHERE id = ?',
                [nombre, email, sesionUsuario.id]
            );
        }

        redirect('/perfil?success=1');
    }

    return (
        <main className="contenedor">
            <div className="page-card">
                <header className="page-header">
                    <div>
                        <h1 className="titulo-poemario">Editar Perfil</h1>
                        <p className="autor">Actualiza tu información personal</p>
                    </div>
                </header>

                <form action={actualizarPerfil} className="formulario-auth">
                    <input
                        type="text"
                        name="nombre"
                        placeholder="Tu nombre"
                        defaultValue={usuario.nombre}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        defaultValue={usuario.email}
                        required
                    />
                    <input
                        type="password"
                        name="password_actual"
                        placeholder="Contraseña actual (solo si cambias)"
                    />
                    <input
                        type="password"
                        name="password_nueva"
                        placeholder="Nueva contraseña"
                    />
                    <input
                        type="password"
                        name="password_confirm"
                        placeholder="Confirmar nueva contraseña"
                    />
                    <button type="submit">Actualizar Perfil</button>
                </form>
                {success && (
                    <p style={{ color: '#1f7a3d', marginTop: '16px', textAlign: 'center' }}>
                        Perfil actualizado correctamente.
                    </p>
                )}
                {error === '1' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        El correo ya está en uso por otro usuario.
                    </p>
                )}
                {error === '2' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        Nombre y correo son obligatorios.
                    </p>
                )}
                {error === '3' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        El correo no tiene un formato válido.
                    </p>
                )}
                {error === '4' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        Debes escribir tu contraseña actual para cambiar la contraseña.
                    </p>
                )}
                {error === '5' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        La contraseña actual no es correcta.
                    </p>
                )}
                {error === '6' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        Las contraseñas nuevas no coinciden.
                    </p>
                )}
                <p className="form-footer"><Link href="/">Volver al inicio</Link></p>
            </div>
        </main>
    );
}