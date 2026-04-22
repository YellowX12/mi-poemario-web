import { db } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type RegistroProps = {
    searchParams?: { error?: string; success?: string };
};

export default async function Registro({ searchParams }: RegistroProps) {
    const params = searchParams ?? {};
    const error = params.error;
    const success = params.success === '1';
    
    async function registrar(formData: FormData) {
        "use server";
        const nombre = formData.get('nombre')?.toString().trim() ?? '';
        const email = formData.get('email')?.toString().trim() ?? '';
        const pass = formData.get('password')?.toString() ?? '';

        if (!nombre || !email || !pass) {
            redirect('/registro?error=2');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            redirect('/registro?error=3');
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]) as [{ id: number }[], unknown];
        if (existing.length > 0) {
            redirect('/registro?error=1');
        }

        const hashedPass = await bcrypt.hash(pass, 10);

        await db.query(
            'INSERT INTO users (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPass]
        );
        redirect('/login?success=1');
    }

    return (
        <main className="contenedor">
            <div className="auth-card">
                <h1 className="titulo-poemario">Registro de Autor</h1>
                <p className="auth-description">Crea tu cuenta para empezar a escribir y editar tus poemas en tu poemario.</p>
                <form action={registrar} className="formulario-auth">
                    <input type="text" name="nombre" placeholder="Tu nombre" required />
                    <input type="email" name="email" placeholder="Correo electrónico" required />
                    <input type="password" name="password" placeholder="Contraseña" required />
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button type="submit">Crear Cuenta</button>
                        {error && <button type="reset" style={{ backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '999px', padding: '14px 18px', cursor: 'pointer', fontWeight: '700' }}>Limpiar</button>}
                    </div>
                </form>
                {success && (
                    <p style={{ color: '#1f7a3d', marginTop: '16px', textAlign: 'center' }}>
                        Registro exitoso. Ahora puedes <Link href="/login">iniciar sesión</Link>.
                    </p>
                )}
                {error === '1' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        El correo electrónico ya está registrado. Intenta con otro o <Link href="/login">inicia sesión</Link>.
                    </p>
                )}
                {error === '2' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        Debes completar nombre, correo y contraseña para registrarte.
                    </p>
                )}
                {error === '3' && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        El correo electrónico no tiene un formato válido.
                    </p>
                )}
                <p className="form-footer">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
            </div>
        </main>
    );
}