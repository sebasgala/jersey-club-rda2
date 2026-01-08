import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const testDatabaseConnection = async (req, res) => {
  try {
    // Consulta básica para verificar la conexión
    const categorias = await prisma.categoria.findMany();
    res.status(200).json({
      message: 'Conexión exitosa con la base de datos',
      totalCategorias: categorias.length,
      categorias,
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({
      message: 'Error al conectar con la base de datos',
      error: error.message,
    });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {
    // Consulta SQL cruda para obtener productos con stock bajo
    const lowStockProducts = await prisma.$queryRaw`
      SELECT * FROM producto WHERE prd_stock < prd_stockminimo
    `;
    res.status(200).json({
      message: 'Productos con stock bajo',
      total: lowStockProducts.length,
      productos: lowStockProducts,
    });
  } catch (error) {
    console.error('Error al consultar productos con stock bajo:', error);
    res.status(500).json({
      message: 'Error al consultar productos con stock bajo',
      error: error.message,
    });
  }
};
