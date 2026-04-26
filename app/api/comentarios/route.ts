import { db } from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const sesion = await obtenerSesion();
        if (!sesion) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const { poemaId, contenido } = await request.json();
        const userId = parseInt(sesion.userId as string);

        // Validar datos
        if (!poemaId || !contenido || contenido.trim().length === 0) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        if (contenido.length > 500) {
            return NextResponse.json({ error: 'Comentario muy largo' }, { status: 400 });
        }

        // Insertar comentario
        await db.query(
            'INSERT INTO comentarios (poema_id, user_id, contenido) VALUES (?, ?, ?)',
            [poemaId, userId, contenido.trim()]
        );

        return NextResponse.json({ success: true, message: 'Comentario agregado' });
    } catch (error) {
        console.error('Error en API de comentarios:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const poemaId = request.nextUrl.searchParams.get('poemaId');

        if (!poemaId) {
            return NextResponse.json({ error: 'poemaId requerido' }, { status: 400 });
        }

        const [comentarios] = await db.query(
            `SELECT c.id, c.contenido, c.fecha, u.nombre as autor 
             FROM comentarios c 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.poema_id = ? 
             ORDER BY c.fecha DESC LIMIT 10`,
            [poemaId]
        ) as any;

        return NextResponse.json(comentarios);
    } catch (error) {
        console.error('Error obteniendo comentarios:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const sesion = await obtenerSesion();
        if (!sesion) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const { comentarioId } = await request.json();
        const userId = parseInt(sesion.userId as string);

        const [comentario] = await db.query(
            'SELECT * FROM comentarios WHERE id = ?',
            [comentarioId]
        ) as any;

        if (comentario.length === 0) {
            return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 });
        }

        // Verificar que sea el autor o admin
        if (comentario[0].user_id !== userId) {
            return NextResponse.json({ error: 'No tiene permiso' }, { status: 403 });
        }

        await db.query('DELETE FROM comentarios WHERE id = ?', [comentarioId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error eliminando comentario:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
