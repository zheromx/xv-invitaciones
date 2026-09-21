-- CreateEnum
CREATE TYPE "Plantilla" AS ENUM ('ELEGANTE_EUCALIPTO', 'CLASICA_DORADA', 'PASTEL_ROMANTICA', 'MODERNA_MINIMAL');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "plantilla" "Plantilla" NOT NULL DEFAULT 'ELEGANTE_EUCALIPTO',
    "nombreQuinceanera" TEXT NOT NULL,
    "nombrePadre" TEXT,
    "nombreMadre" TEXT,
    "nombrePadrinos" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "fechaLimiteRsvp" TIMESTAMP(3),
    "tieneMisa" BOOLEAN NOT NULL DEFAULT false,
    "misaLugar" TEXT,
    "misaDireccion" TEXT,
    "misaHora" TEXT,
    "recepcionLugar" TEXT NOT NULL,
    "recepcionDireccion" TEXT NOT NULL,
    "recepcionHora" TEXT NOT NULL,
    "codigoVestimenta" TEXT,
    "infoAdicional" TEXT,
    "fotoPrincipalUrl" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MomentoEvento" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MomentoEvento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoGaleria" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FotoGaleria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoRegalos" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "mostrar" BOOLEAN NOT NULL DEFAULT false,
    "mensaje" TEXT,
    "datosBancarios" TEXT,
    "numeroEvento" TEXT,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoRegalos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesaRegalo" (
    "id" TEXT NOT NULL,
    "infoRegalosId" TEXT NOT NULL,
    "tienda" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "MesaRegalo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitacion" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "respondida" BOOLEAN NOT NULL DEFAULT false,
    "respondidaEn" TIMESTAMP(3),
    "enviadaEn" TIMESTAMP(3),
    "creadaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadaEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Persona" (
    "id" TEXT NOT NULL,
    "invitacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "asiste" BOOLEAN,

    CONSTRAINT "Persona_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "MomentoEvento_eventoId_idx" ON "MomentoEvento"("eventoId");

-- CreateIndex
CREATE INDEX "FotoGaleria_eventoId_idx" ON "FotoGaleria"("eventoId");

-- CreateIndex
CREATE UNIQUE INDEX "InfoRegalos_eventoId_key" ON "InfoRegalos"("eventoId");

-- CreateIndex
CREATE INDEX "MesaRegalo_infoRegalosId_idx" ON "MesaRegalo"("infoRegalosId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitacion_token_key" ON "Invitacion"("token");

-- CreateIndex
CREATE INDEX "Invitacion_eventoId_idx" ON "Invitacion"("eventoId");

-- CreateIndex
CREATE INDEX "Persona_invitacionId_idx" ON "Persona"("invitacionId");

-- AddForeignKey
ALTER TABLE "Evento" ADD CONSTRAINT "Evento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MomentoEvento" ADD CONSTRAINT "MomentoEvento_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoGaleria" ADD CONSTRAINT "FotoGaleria_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoRegalos" ADD CONSTRAINT "InfoRegalos_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MesaRegalo" ADD CONSTRAINT "MesaRegalo_infoRegalosId_fkey" FOREIGN KEY ("infoRegalosId") REFERENCES "InfoRegalos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitacion" ADD CONSTRAINT "Invitacion_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Persona" ADD CONSTRAINT "Persona_invitacionId_fkey" FOREIGN KEY ("invitacionId") REFERENCES "Invitacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
