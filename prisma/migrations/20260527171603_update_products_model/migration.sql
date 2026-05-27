-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
