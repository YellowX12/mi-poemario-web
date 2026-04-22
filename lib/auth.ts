import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
import { RowDataPacket } from 'mysql2';

const SECRET = process.env.SESSION_SECRET ?? 'tu_clave_secreta_super_segura';
const KEY = new TextEncoder().encode(SECRET);

type Usuario = RowDataPacket & { id: number; nombre: string; email: string; password: string };

export async function crearSesion(userId: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expira en 7 días
    const session = await new SignJWT({ userId })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(KEY);

    (await cookies()).set('session', session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
    });
}

export async function obtenerSesion() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    try {
        const { payload } = await jwtVerify(session, KEY, { algorithms: ['HS256'] });
        return payload;
    } catch {
        return null;
    }
}

export async function obtenerUsuario() {
    const session = await obtenerSesion();
    if (!session) return null;
    const [usuarios] = await db.query<Usuario[]>('SELECT id, nombre, email FROM users WHERE id = ?', [session.userId]);
    return usuarios[0] || null;
}

export async function esAdmin() {
    const usuario = await obtenerUsuario();
    return usuario?.email === 'admi@admid.com';
}

export async function borrarSesion() {
    (await cookies()).set('session', '', {
        expires: new Date(0),
        path: '/',
        sameSite: 'lax',
    });
}