import { db } from '@/lib/db';
import { obtenerSesion } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

interface PoemLike {
    id: number;
    poema_id: number;
    user_id: number;
    tipo: 'like' | 'dislike';
}

interface LikeCount {
    tipo: 'like' | 'dislike';
    cantidad: number;
}

export async function POST(request: NextRequest) {
    try {
        const sesion = await obtenerSesion();
        if (!sesion) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        const { poemaId, tipo } = await request.json();
        const userId = parseInt(sesion.userId as string);

        // Validar datos
        if (!poemaId || !['like', 'dislike'].includes(tipo)) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        // Verificar si ya existe un like/dislike
        const [existente] = await db.query(
            'SELECT * FROM poem_likes WHERE poema_id = ? AND user_id = ?',
            [poemaId, userId]
        ) as [PoemLike[], unknown];

        if (existente.length > 0) {
            // Si es el mismo tipo, eliminar
            if (existente[0].tipo === tipo) {
                await db.query(
                    'DELETE FROM poem_likes WHERE poema_id = ? AND user_id = ?',
                    [poemaId, userId]
                );
                return NextResponse.json({ action: 'removed', tipo });
            } else {
                // Si es diferente, actualizar
                await db.query(
                    'UPDATE poem_likes SET tipo = ? WHERE poema_id = ? AND user_id = ?',
                    [tipo, poemaId, userId]
                );
                return NextResponse.json({ action: 'updated', tipo });
            }
        } else {
            // Insertar nuevo like/dislike
            await db.query(
                'INSERT INTO poem_likes (poema_id, user_id, tipo) VALUES (?, ?, ?)',
                [poemaId, userId, tipo]
            );
            return NextResponse.json({ action: 'added', tipo });
        }
    } catch (error) {
        console.error('Error en API de likes:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const poemaId = request.nextUrl.searchParams.get('poemaId');

        if (!poemaId) {
            return NextResponse.json({ error: 'poemaId requerido' }, { status: 400 });
        }

        const [likes] = await db.query(
            'SELECT tipo, COUNT(*) as cantidad FROM poem_likes WHERE poema_id = ? GROUP BY tipo',
            [poemaId]
        ) as [LikeCount[], unknown];

        const resultado = { likes: 0, dislikes: 0 };
        for (const row of likes) {
            if (row.tipo === 'like') resultado.likes = row.cantidad;
            if (row.tipo === 'dislike') resultado.dislikes = row.cantidad;
        }

        return NextResponse.json(resultado);
    } catch (error) {
        console.error('Error obteniendo likes:', error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
