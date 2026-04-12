import { db } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type RegistroProps = {
    searchParams?: Promise<{ error?: string }>;
};

export default async function Registro({ searchParams }: RegistroProps) {
    const params = await searchParams;
    const error = params?.error === '1';
    
    async function registrar(formData: FormData) {
        "use server";
        const nombre = formData.get('nombre')?.toString() ?? '';
        const email = formData.get('email')?.toString() ?? '';
        const pass = formData.get('password')?.toString() ?? '';

        // Verificar si el email ya existe
        const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]) as [{ id: number }[], unknown];
        if (existing.length > 0) {
            redirect('/registro?error=1');
        }

        // Encriptamos la contraseña antes de guardarla
        const hashedPass = await bcrypt.hash(pass, 10);

        await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hashedPass]
        );
        redirect('/login');
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
                {error && (
                    <p style={{ color: '#b02a37', marginTop: '16px', textAlign: 'center' }}>
                        El correo electrónico ya está registrado. Intenta con otro o <Link href="/login">inicia sesión</Link>.
                    </p>
                )}
                <p className="form-footer">¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link></p>
            </div>
        </main>
    );
}