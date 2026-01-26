import prisma from './prisma.js';

/**
 * Genera un registro de auditoría en la base de datos
 */
export const logAudit = async ({ usuarioId, accion, tabla, claveRegistro, descripcion, ip = '127.0.0.1' }) => {
    const now = new Date();
    try {
        // Extraer solo la parte numérica de la clave para el campo INT de la base de datos
        const numericKey = typeof claveRegistro === 'string'
            ? (parseInt(claveRegistro.replace(/[^0-9]/g, '')) || 0)
            : claveRegistro;

        await prisma.auditoria.create({
            data: {
                usuario_id: usuarioId || 'SYSTEM',
                fecha: now,
                hora: now,
                accion: accion,
                tabla: tabla,
                clave_registro: numericKey,
                descripcion: descripcion,
                ip_maquina: ip
            }
        });
    } catch (err) {
        console.error('❌ Error en logger de auditoría:', err.message);
    }
};

/**
 * Genera un ID incremental con prefijo (Longitud total 6)
 */
export const generateNextId = async (model, prefix) => {
    const lastRecord = await prisma[model].findMany({
        orderBy: { [model === 'usuario' ? 'id_usuario' : (model === 'cliente' ? 'id_cliente' : (model === 'empleado' ? 'id_empleado' : (model === 'pedido' ? 'id_pedido' : (model === 'factura' ? 'id_factura' : 'id_detalle'))))]: 'desc' },
        take: 1
    });

    let nextNum = 1;
    if (lastRecord.length > 0) {
        const lastId = Object.values(lastRecord[0])[0];
        const match = lastId.match(/\d+/);
        if (match) {
            nextNum = parseInt(match[0]) + 1;
        }
    }

    const paddingLength = 6 - prefix.length;
    return `${prefix}${String(nextNum).padStart(paddingLength, '0')}`;
};

/**
 * Helper para formatear errores de Prisma
 */
export const handlePrismaError = (err, res) => {
    console.error('❌ Database Error:', err);
    return res.status(500).json({
        success: false,
        message: 'Error en la operación de base de datos',
        error: err.message
    });
};
