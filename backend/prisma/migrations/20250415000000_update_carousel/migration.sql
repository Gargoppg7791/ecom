-- Add imageUrl column as nullable
ALTER TABLE "Carousel" ADD COLUMN "imageUrl" TEXT;

-- Copy data from image to imageUrl
UPDATE "Carousel" SET "imageUrl" = "image";

-- Make imageUrl required
ALTER TABLE "Carousel" ALTER COLUMN "imageUrl" SET NOT NULL;

-- Drop old columns
ALTER TABLE "Carousel" DROP COLUMN "image";
ALTER TABLE "Carousel" DROP COLUMN "path"; 