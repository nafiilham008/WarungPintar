-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "no" INTEGER,
    "kategori" TEXT,
    "nama" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT,
    "lokasi" TEXT NOT NULL,
    "detail" TEXT,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
