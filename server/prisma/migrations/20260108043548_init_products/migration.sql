/*
  Warnings:

  - You are about to drop the `cart_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_userId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_userId_fkey";

-- DropTable
DROP TABLE "cart_items";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "products";

-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" CHAR(6) NOT NULL,
    "cat_nombre" VARCHAR(100) NOT NULL,
    "cat_descripcion" TEXT,
    "cat_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "cliente" (
    "id_cliente" CHAR(6) NOT NULL,
    "cli_nombre" VARCHAR(100) NOT NULL,
    "cli_apellido" VARCHAR(100) NOT NULL,
    "cli_email" VARCHAR(100),
    "cli_telefono" VARCHAR(20),
    "cli_direccion" TEXT,
    "cli_ciudad" VARCHAR(50),
    "cli_pais" VARCHAR(50),
    "cli_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "departamento" (
    "id_departamento" CHAR(6) NOT NULL,
    "dep_nombre" VARCHAR(100) NOT NULL,
    "dep_descripcion" TEXT,
    "dep_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departamento_pkey" PRIMARY KEY ("id_departamento")
);

-- CreateTable
CREATE TABLE "empleado" (
    "id_empleado" CHAR(6) NOT NULL,
    "emp_nombre" VARCHAR(100) NOT NULL,
    "emp_apellido" VARCHAR(100) NOT NULL,
    "emp_cargo" VARCHAR(50),
    "emp_salario" DECIMAL(10,2),
    "emp_fechaingreso" DATE NOT NULL DEFAULT CURRENT_DATE,
    "id_departamento" CHAR(6),
    "emp_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empleado_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE "factura" (
    "id_factura" CHAR(6) NOT NULL,
    "id_pedido" CHAR(6) NOT NULL,
    "id_usuario" CHAR(6),
    "fac_numero" VARCHAR(50) NOT NULL,
    "fac_total" DECIMAL(10,2) NOT NULL,
    "fac_fechaemision" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fac_tipo" VARCHAR(20),
    "fac_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "factura_pkey" PRIMARY KEY ("id_factura")
);

-- CreateTable
CREATE TABLE "pedido" (
    "id_pedido" CHAR(6) NOT NULL,
    "id_usuario" CHAR(6) NOT NULL,
    "id_cliente" CHAR(6) NOT NULL,
    "ped_total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ped_subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ped_iva" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ped_descuento" DECIMAL(10,2) DEFAULT 0,
    "ped_estado" VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    "ped_fechaentrega" DATE,
    "ped_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ped_updatedat" TIMESTAMP(6),

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("id_pedido")
);

-- CreateTable
CREATE TABLE "pedido_detalle" (
    "id_detalle" CHAR(6) NOT NULL,
    "id_pedido" CHAR(6) NOT NULL,
    "id_producto" CHAR(6) NOT NULL,
    "det_cantidad" INTEGER NOT NULL,
    "det_preciounitario" DECIMAL(10,2) NOT NULL,
    "det_subtotal" DECIMAL(10,2) NOT NULL,
    "det_descuento" DECIMAL(5,2) DEFAULT 0,
    "det_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "producto" (
    "id_producto" CHAR(6) NOT NULL,
    "prd_nombre" VARCHAR(200) NOT NULL,
    "prd_descripcion" TEXT,
    "prd_precio" DECIMAL(10,2) NOT NULL,
    "prd_stock" INTEGER NOT NULL DEFAULT 0,
    "prd_stockminimo" INTEGER NOT NULL DEFAULT 5,
    "id_categoria" CHAR(6),
    "prd_activo" BOOLEAN NOT NULL DEFAULT true,
    "prd_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prd_updatedat" TIMESTAMP(6),

    CONSTRAINT "producto_pkey" PRIMARY KEY ("id_producto")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" CHAR(6) NOT NULL,
    "usu_email" VARCHAR(100) NOT NULL,
    "usu_passwordhash" TEXT NOT NULL,
    "usu_role" VARCHAR(10) NOT NULL,
    "id_cliente" CHAR(6),
    "id_empleado" CHAR(6),
    "usu_createdat" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usu_lastlogin" TIMESTAMP(6),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_cat_nombre_key" ON "categoria"("cat_nombre");

-- CreateIndex
CREATE UNIQUE INDEX "cliente_cli_email_key" ON "cliente"("cli_email");

-- CreateIndex
CREATE UNIQUE INDEX "factura_fac_numero_key" ON "factura"("fac_numero");

-- CreateIndex
CREATE INDEX "idx_factura_numero" ON "factura"("fac_numero");

-- CreateIndex
CREATE INDEX "idx_factura_pedido" ON "factura"("id_pedido");

-- CreateIndex
CREATE INDEX "idx_pedido_cliente" ON "pedido"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_pedido_estado" ON "pedido"("ped_estado");

-- CreateIndex
CREATE INDEX "idx_pedido_fecha" ON "pedido"("ped_createdat");

-- CreateIndex
CREATE INDEX "idx_pedido_usuario" ON "pedido"("id_usuario");

-- CreateIndex
CREATE INDEX "idx_detalle_pedido" ON "pedido_detalle"("id_pedido");

-- CreateIndex
CREATE INDEX "idx_detalle_producto" ON "pedido_detalle"("id_producto");

-- CreateIndex
CREATE INDEX "idx_producto_categoria" ON "producto"("id_categoria");

-- CreateIndex
CREATE INDEX "idx_producto_nombre" ON "producto"("prd_nombre");

-- CreateIndex
CREATE INDEX "idx_producto_stock" ON "producto"("prd_stock");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usu_email_key" ON "usuario"("usu_email");

-- CreateIndex
CREATE INDEX "idx_usuario_email" ON "usuario"("usu_email");

-- CreateIndex
CREATE INDEX "idx_usuario_role" ON "usuario"("usu_role");

-- AddForeignKey
ALTER TABLE "empleado" ADD CONSTRAINT "fk_empleado_departamento" FOREIGN KEY ("id_departamento") REFERENCES "departamento"("id_departamento") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "fk_factura_pedido" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura" ADD CONSTRAINT "fk_factura_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "fk_pedido_cliente" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "fk_pedido_usuario" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_detalle" ADD CONSTRAINT "fk_detalle_pedido" FOREIGN KEY ("id_pedido") REFERENCES "pedido"("id_pedido") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_detalle" ADD CONSTRAINT "fk_detalle_producto" FOREIGN KEY ("id_producto") REFERENCES "producto"("id_producto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "fk_producto_categoria" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "fk_usuario_cliente" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "fk_usuario_empleado" FOREIGN KEY ("id_empleado") REFERENCES "empleado"("id_empleado") ON DELETE CASCADE ON UPDATE CASCADE;
