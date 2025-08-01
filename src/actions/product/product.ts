"use server";
import { z } from "zod";

import { db } from "@/shared/lib/db";
import {
  TAddProductFormValues,
  TCartListItemDB,
  TPath,
  TProductListItem,
  TProductPageInfo,
  TSpecification,
} from "@/shared/types/product";

const ValidateAddProduct = z.object({
  name: z.string().min(3),
  brandID: z.string().min(6),
  specialFeatures: z.array(z.string()),
  desc: z.string().optional(),
  images: z.array(z.string()),
  categoryID: z.string().min(6),
  price: z.string().min(1),
  salePrice: z.string(),
  specifications: z.array(
    z.object({
      specGroupID: z.string().min(6),
      specValues: z.array(z.string()),
    })
  ),
});

const convertStringToFloat = (str: string) => {
  str.replace(/,/, ".");
  return str ? parseFloat(str) : 0.0;
};

export const addProduct = async (data: TAddProductFormValues) => {
  if (!ValidateAddProduct.safeParse(data).success) return { error: "Invalid Data!" };

  try {
    const price = convertStringToFloat(data.price);
    const salePrice = data.salePrice ? convertStringToFloat(data.salePrice) : null;

    const result = db.category.update({
      where: {
        id: data.categoryID,
      },
      data: {
        products: {
          create: {
            name: data.name,
            desc: data.desc,
            brandID: data.brandID,
            specialFeatures: data.specialFeatures,
            isAvailable: data.isAvailable,
            price: price,
            salePrice: salePrice,
            images: [...data.images],
            specs: data.specifications,
          },
        },
      },
    });
    if (!result) return { error: "Can't Insert Data" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const getAllProducts = async () => {
  try {
    const result: TProductListItem[] | null = await db.product.findMany({
      select: {
        id: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!result) return { error: "Can't Get Data from Database!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const getOneProduct = async (productID: string) => {
  if (!productID || productID === "") return { error: "Invalid Product ID!" };

  try {
    const result = await db.product.findFirst({
      where: {
        id: productID,
      },
      select: {
        id: true,
        name: true,
        desc: true,
        images: true,
        price: true,
        salePrice: true,
        specs: true,
        specialFeatures: true,
        isAvailable: true,
        category: {
          select: {
            id: true,
            parentID: true,
          },
        },
      },
    });
    if (!result) return { error: "Invalid Data!" };

    const specifications = await generateSpecTable(result.specs as any);
    if (!specifications || specifications.length === 0) return { error: "Invalid Date" };

    const pathArray: TPath[] | null = await getPathByCategoryID(result.category.id, result.category.parentID);
    if (!pathArray || pathArray.length === 0) return { error: "Invalid Date" };

    //eslint-disable-next-line
    const { specs, ...others } = result;
    const mergedResult: TProductPageInfo = {
      ...others,
      price: Number(others.price),
      salePrice: others.salePrice ? Number(others.salePrice) : null,
      optionSets: [], // Empty array since optionSets aren't implemented yet
      specifications,
      path: pathArray,
    };

    return { res: mergedResult };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const getCartProducts = async (productIDs: string[]) => {
  if (!productIDs || productIDs.length === 0) return { error: "Invalid Product List" };

  try {
    const rawResult = await db.product.findMany({
      where: {
        id: { in: productIDs },
      },
      select: {
        id: true,
        name: true,
        images: true,
        price: true,
        salePrice: true,
      },
    });

    if (!rawResult) return { error: "Can't Get Data from Database!" };

    // Convert Decimal fields to numbers for Client Components
    const result: TCartListItemDB[] = rawResult.map((product) => ({
      ...product,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
    }));

    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

export const deleteProduct = async (productID: string) => {
  if (!productID || productID === "") return { error: "Invalid Data!" };
  try {
    const result = await db.product.delete({
      where: {
        id: productID,
      },
    });

    if (!result) return { error: "Can't Delete!" };
    return { res: result };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
};

const generateSpecTable = async (rawSpec: any): Promise<TSpecification[] | null> => {
  try {
    if (!rawSpec || typeof rawSpec !== "object") return null;

    const specifications: TSpecification[] = [];

    // Convert JSON specs to the expected format
    Object.entries(rawSpec).forEach(([groupName, groupSpecs]) => {
      if (typeof groupSpecs === "object" && groupSpecs !== null) {
        const specs: { name: string; value: string }[] = [];
        Object.entries(groupSpecs).forEach(([key, value]) => {
          specs.push({
            name: key,
            value: String(value),
          });
        });

        specifications.push({
          groupName: groupName.charAt(0).toUpperCase() + groupName.slice(1), // Capitalize first letter
          specs,
        });
      } else if (Array.isArray(groupSpecs)) {
        // Handle array format (like features)
        const specs: { name: string; value: string }[] = groupSpecs.map((feature, index) => ({
          name: `Feature ${index + 1}`,
          value: String(feature),
        }));

        specifications.push({
          groupName: groupName.charAt(0).toUpperCase() + groupName.slice(1),
          specs,
        });
      }
    });

    return specifications.length > 0 ? specifications : null;
  } catch (error) {
    console.error("Error generating spec table:", error);
    return null;
  }
};

const getPathByCategoryID = async (categoryID: string, parentID: string | null) => {
  try {
    if (!categoryID || categoryID === "") return null;
    if (!parentID || parentID === "") return null;
    const result: TPath[] = await db.category.findMany({
      where: {
        OR: [{ id: categoryID }, { id: parentID }, { parentID: null }],
      },
      select: {
        id: true,
        parentID: true,
        name: true,
        url: true,
      },
    });
    if (!result || result.length === 0) return null;

    const path: TPath[] = [];
    let tempCatID: string | null = categoryID;
    let searchCount = 0;

    const generatePath = () => {
      const foundCatIndex = result.findIndex((cat) => cat.id === tempCatID);
      if (foundCatIndex === -1) return;
      path.unshift(result[foundCatIndex]);
      tempCatID = result[foundCatIndex].parentID;
      if (!tempCatID) return;
      searchCount++;
      if (searchCount <= 3) generatePath();
      return;
    };
    generatePath();

    if (!path || path.length === 0) return null;
    return path;
  } catch {
    return null;
  }
};
