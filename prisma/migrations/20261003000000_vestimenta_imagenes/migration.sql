-- Imágenes opcionales de vestimenta (damas y caballeros) dentro del bloque de
-- protocolo. Migración aditiva y nullable: las filas existentes quedan en NULL
-- y con visibilidad false, por lo que no cambia el render actual.
ALTER TABLE "Evento" ADD COLUMN "vestimentaDamasUrl" TEXT;
ALTER TABLE "Evento" ADD COLUMN "vestimentaCaballerosUrl" TEXT;
ALTER TABLE "Evento" ADD COLUMN "mostrarVestimentaDamas" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Evento" ADD COLUMN "mostrarVestimentaCaballeros" BOOLEAN NOT NULL DEFAULT false;
