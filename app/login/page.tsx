import { db } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { crearSesion } from '../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { RowDataPacket } from 'mysql2';

type Usuario = RowDataPacket & { id: number; email: string; password: string };

type LoginProps = {
    searchParams?: Promise<{ error?: string }>;
};

export default async function Login({ searchParams }: LoginProps) {
    const params = await searchParams;
    const error = params?.error === '1';

    async function iniciarSesion(formData: FormData) {
        "use server";
        const email = formData.get('email')?.toString() ?? '';
        const pass = formData.get('password')?.toString() ?? '';

        // Crear usuario admin de ejemplo si no existe
        try {
            const hashedAdminPass = await bcrypt.hash('admin', 10);
            await db.query(
                'INSERT IGNORE INTO users (nombre, email, password) VALUES (?, ?, ?)',
                ['Admin', 'admi@admid.com', hashedAdminPass]
            );
        } catch {
            
        }

        const [usuarios] = await db.query<Usuario[]>('SELECT * FROM users WHERE email = ?', [email]);
        const usuario = usuarios[0];

        if (usuario && await bcrypt.compare(pass, usuario.password)) {
            await crearSesion(usuario.id.toString());
            redirect('/escribir');
        } else {
            redirect('/login?error=1');
        }
    }

    return (
        <main className="contenedor">
            <div className="auth-card">
                <h1 className="titulo-poemario">Iniciar Sesión</h1>
                <p className="auth-description">Accede para escribir, editar y revisar tus poemas desde el panel privado.</p>
                <div style={{ backgroundColor: '#f7f2ea', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd7d0' }}>
                    <strong>¡Bienvenido!</strong><br />
                    Inicia sesión con tu cuenta registrada o <Link href="/registro" style={{ color: '#8a7968', textDecoration: 'underline' }}>regístrate</Link> si aún no tienes una cuenta.
                </div>
                <form action={iniciarSesion} className="formulario-auth">
                    <input type="email" name="email" placeholder="Correo" required />
                    <input type="password" name="password" placeholder="Contraseña" required />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button type="submit">Entrar al Panel</button>
                        {error && <button type="reset" style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '999px', padding: '14px 18px', cursor: 'pointer', fontWeight: '700' }}>Limpiar</button>}
                    </div>
                </form>
                {error && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        Credenciales incorrectas. Verifica tu correo y contraseña.
                    </p>
                )}
                <p className="form-footer">¿No tienes cuenta? <Link href="/registro">Regístrate</Link></p>
            </div>
        </main>
    );
}
