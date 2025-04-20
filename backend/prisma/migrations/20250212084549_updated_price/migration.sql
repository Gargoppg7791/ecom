/*
  Warnings:

  - You are about to alter the column `totalPrice` on the `Cart` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `totalDiscountedPrice` on the `Cart` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `discount` on the `Cart` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `price` on the `CartItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `discountedPrice` on the `CartItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `totalPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `totalDiscountedPrice` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `discount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `price` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `discountedPrice` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `discountedPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "totalPrice" SET DEFAULT 0,
ALTER COLUMN "totalPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "totalDiscountedPrice" SET DEFAULT 0,
ALTER COLUMN "totalDiscountedPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "discount" SET DEFAULT 0,
ALTER COLUMN "discount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "CartItem" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "discountedPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "totalDiscountedPrice" SET DATA TYPE INTEGER,
ALTER COLUMN "discount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "discountedPrice" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "discountedPrice" SET DATA TYPE INTEGER;
