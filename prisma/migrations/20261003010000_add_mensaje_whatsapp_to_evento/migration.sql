-- Mensaje privado del panel que acompaña al enlace al compartir por WhatsApp.
-- Migración aditiva y nullable: las filas existentes quedan en NULL (fallback actual).
ALTER TABLE "Evento" ADD COLUMN "mensajeWhatsApp" TEXT;
