-- CreateEnum
CREATE TYPE "OptionSetType" AS ENUM ('TEXT', 'COLOR');

-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('MAIN', 'LIST', 'PRODUCT');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "parentID" TEXT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "iconUrl" TEXT,
    "iconSize" INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category_OptionSet" (
    "id" TEXT NOT NULL,
    "optionID" TEXT NOT NULL,
    "categoryID" TEXT NOT NULL,

    CONSTRAINT "Category_OptionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "type" "OptionSetType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OptionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category_SpecGroup" (
    "id" TEXT NOT NULL,
    "specGroupID" TEXT NOT NULL,
    "categoryID" TEXT NOT NULL,

    CONSTRAINT "Category_SpecGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecGroup" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "specs" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "desc" TEXT,
    "specialFeatures" TEXT[],
    "images" TEXT[],
    "categoryID" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "salePrice" DECIMAL(10,2),
    "specs" JSONB,
    "brandID" TEXT NOT NULL,
    "sku" TEXT,
    "stock" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOptionSet" (
    "id" TEXT NOT NULL,
    "productID" TEXT NOT NULL,
    "optionSetID" TEXT NOT NULL,
    "selectedValue" TEXT,

    CONSTRAINT "ProductOptionSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pageType" "PageType" NOT NULL,
    "pagePath" TEXT,
    "deviceResolution" TEXT,
    "productID" TEXT,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_url_key" ON "Category"("url");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_url_idx" ON "Category"("url");

-- CreateIndex
CREATE INDEX "Category_parentID_idx" ON "Category"("parentID");

-- CreateIndex
CREATE UNIQUE INDEX "Category_OptionSet_optionID_categoryID_key" ON "Category_OptionSet"("optionID", "categoryID");

-- CreateIndex
CREATE UNIQUE INDEX "Category_SpecGroup_specGroupID_categoryID_key" ON "Category_SpecGroup"("specGroupID", "categoryID");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_categoryID_idx" ON "Product"("categoryID");

-- CreateIndex
CREATE INDEX "Product_brandID_idx" ON "Product"("brandID");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Product_isAvailable_idx" ON "Product"("isAvailable");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductOptionSet_productID_optionSetID_key" ON "ProductOptionSet"("productID", "optionSetID");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "Brand_name_idx" ON "Brand"("name");

-- CreateIndex
CREATE INDEX "PageVisit_time_idx" ON "PageVisit"("time");

-- CreateIndex
CREATE INDEX "PageVisit_pageType_idx" ON "PageVisit"("pageType");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "SearchLog_query_idx" ON "SearchLog"("query");

-- CreateIndex
CREATE INDEX "SearchLog_timestamp_idx" ON "SearchLog"("timestamp");

-- CreateIndex
CREATE INDEX "SearchLog_userId_idx" ON "SearchLog"("userId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentID_fkey" FOREIGN KEY ("parentID") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category_OptionSet" ADD CONSTRAINT "Category_OptionSet_optionID_fkey" FOREIGN KEY ("optionID") REFERENCES "OptionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category_OptionSet" ADD CONSTRAINT "Category_OptionSet_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category_SpecGroup" ADD CONSTRAINT "Category_SpecGroup_specGroupID_fkey" FOREIGN KEY ("specGroupID") REFERENCES "SpecGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category_SpecGroup" ADD CONSTRAINT "Category_SpecGroup_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryID_fkey" FOREIGN KEY ("categoryID") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandID_fkey" FOREIGN KEY ("brandID") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOptionSet" ADD CONSTRAINT "ProductOptionSet_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOptionSet" ADD CONSTRAINT "ProductOptionSet_optionSetID_fkey" FOREIGN KEY ("optionSetID") REFERENCES "OptionSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVisit" ADD CONSTRAINT "PageVisit_productID_fkey" FOREIGN KEY ("productID") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchLog" ADD CONSTRAINT "SearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
