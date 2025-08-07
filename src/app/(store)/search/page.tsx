"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import ProductCard from "@/domains/product/components/productCard";
import { ProductListSkeleton } from "@/domains/store/productList/components";
import Filters from "@/domains/store/productList/components/filters";
import { DEFAULT_FILTERS, SORT_DATA, sortDropdownData } from "@/domains/store/productList/constants";
import { TFilterBrands, TFilters, TListItem } from "@/domains/store/productList/types";
import { TPageStatus } from "@/domains/store/productList/types/";
import { getFiltersFromProductList } from "@/domains/store/productList/utils";
import Button from "@/shared/components/UI/button";
import DropDownList from "@/shared/components/UI/dropDown";
import LineList from "@/shared/components/UI/lineList";
import { cn } from "@/shared/utils/styling";

const SearchPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState<string | null>("");

  const [productList, setProductList] = useState<TListItem[]>([]);
  const [sortIndex, setSortIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [filters, setFilters] = useState<TFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<TFilters>({
    ...DEFAULT_FILTERS,
    priceMinMax: [...DEFAULT_FILTERS.priceMinMax],
  });

  const [isSearchLoading, setIsSearchLoading] = useState(true);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    setQuery(query);
  }, []);
  useEffect(() => {
    const searchProducts = async () => {
      if (query && !query.trim()) {
        setProductList([]);
        setIsSearchLoading(false);
        return;
      }

      setIsSearchLoading(true);

      try {
        if (!query || query.trim() === "") {
          return;
        }
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=100`);
        const data = await response.json();

        if (response.ok && data.products) {
          let filteredProducts = data.products;

          // Apply filters if any
          if (isFilterApplied) {
            // Filter by brands
            const selectedBrands = appliedFilters.brands.filter((b) => b.isSelected).map((b) => b.id);
            if (selectedBrands.length > 0) {
              filteredProducts = filteredProducts.filter((product: TListItem) =>
                selectedBrands.includes(product.brand.id)
              );
            }

            // Filter by price range
            filteredProducts = filteredProducts.filter(
              (product: TListItem) =>
                product.price >= appliedFilters.priceMinMax[0] && product.price <= appliedFilters.priceMinMax[1]
            );

            // Filter by stock status
            if (appliedFilters.stockStatus !== "all") {
              filteredProducts = filteredProducts.filter((product: TListItem) =>
                appliedFilters.stockStatus === "inStock" ? product.isAvailable : !product.isAvailable
              );
            }
          }

          // Apply sorting
          //   const sortConfig = SORT_DATA[sortIndex];
          //   if (sortConfig.field && sortConfig.field !== "default") {
          //     filteredProducts.sort((a: any, b: any) => {
          //       const aValue = a[sortConfig.field];
          //       const bValue = b[sortConfig.field];

          //       if (sortConfig.direction === "asc") {
          //         return aValue > bValue ? 1 : -1;
          //       } else {
          //         return aValue < bValue ? 1 : -1;
          //       }
          //     });
          //   }

          if (isFilterApplied) {
            setFilters(appliedFilters);
            setProductList(filteredProducts);
          } else {
            const filtersFromDB = getFiltersFromProductList(data.products);
            setFilters(filtersFromDB);
            setProductList(filteredProducts);
          }
        } else {
          setProductList([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setProductList([]);
      }

      setIsSearchLoading(false);
    };

    searchProducts();
  }, [query, sortIndex, appliedFilters, isFilterApplied]);

  const handleSortChange = (newIndex: number) => {
    setSortIndex(newIndex);
  };

  const toggleFiltersWindow = (visibility: boolean) => {
    setShowFilters(visibility);
    if (visibility) {
      document.documentElement.classList.add("noScroll");
    } else {
      document.documentElement.classList.remove("noScroll");
    }
  };

  const handleBrandChange = (index: number) => {
    const newBrandList = JSON.parse(JSON.stringify(filters.brands));
    newBrandList[index].isSelected = !newBrandList[index].isSelected;
    setFilters({ ...filters, brands: newBrandList });
  };

  const defineFilterChangeStatus = () => {
    if (appliedFilters.stockStatus !== filters.stockStatus) return false;
    if (JSON.stringify(appliedFilters.brands) !== JSON.stringify(filters.brands)) return false;
    if (JSON.stringify(appliedFilters.priceMinMax) !== JSON.stringify(filters.priceMinMax)) return false;
    return true;
  };

  const isFilterChanged: boolean = defineFilterChangeStatus();

  const handleApplyFilter = () => {
    const newFilter: TFilters = {
      brands: JSON.parse(JSON.stringify(filters.brands)),
      priceMinMax: [...filters.priceMinMax],
      stockStatus: filters.stockStatus,
      priceMinMaxLimitation: [...filters.priceMinMaxLimitation],
    };
    setIsFilterApplied(true);
    setAppliedFilters(newFilter);
  };

  const handleResetFilters = () => {
    const newBrands: TFilterBrands[] = [];
    filters.brands.forEach((b) => newBrands.push({ id: b.id, name: b.name, isSelected: true }));
    const newFilter: TFilters = {
      brands: newBrands,
      priceMinMax: [...filters.priceMinMaxLimitation],
      stockStatus: "all",
      priceMinMaxLimitation: [...filters.priceMinMaxLimitation],
    };
    setIsFilterApplied(false);
    setAppliedFilters(newFilter);
  };

  const getPageStatus = (): TPageStatus => {
    if (isSearchLoading) {
      if (isFilterApplied) return "filterLoading";
      return "pageLoading";
    }

    if (productList.length > 0) return "filledProductList";

    if (isFilterApplied) return "filterHasNoProduct";

    return "categoryHasNoProduct";
  };

  const currentPageStatus: TPageStatus = getPageStatus();

  const pageStatusJSX = {
    pageLoading: (
      <div className="flex flex-wrap gap-4 mt-7 ml-2 mb-[400px]">
        <ProductListSkeleton />
      </div>
    ),
    filterLoading: (
      <div className="flex flex-wrap gap-4 mt-7 ml-2 mb-[400px]">
        <ProductListSkeleton />
      </div>
    ),
    filledProductList: (
      <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 gap-2 mb-14">
        {productList.map((product) => (
          <ProductCard
            key={product.id}
            imgUrl={[product.images[0], product.images[1]]}
            name={product.name}
            price={product.price}
            isAvailable={product.isAvailable}
            dealPrice={product.salePrice || undefined}
            specs={product.specialFeatures}
            url={"/product/" + product.id}
          />
        ))}
      </div>
    ),
    categoryHasNoProduct: (
      <div className="flex flex-col items-center justify-center text-sm min-h-[400px] gap-4">
        <span>No products found for &quot;{query}&quot;</span>
        <p className="text-gray-500">Try adjusting your search terms or browse our categories</p>
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Browse All Products
        </Link>
      </div>
    ),
    filterHasNoProduct: (
      <div className="flex flex-col items-center justify-center text-sm min-h-[400px] gap-4">
        <span>No products found with current filters!</span>
        <Button onClick={handleResetFilters} className="w-[200px]">
          Reset Filters
        </Button>
      </div>
    ),
  }[currentPageStatus];

  return (
    <div className="mt-[136px] bg-white">
      <div className="w-full h-auto md:h-[130px] py-5 px-2.5 md:p-0 flex mt-32 sm:mt-0 flex-col justify-center items-center bg-gray-200/80">
        <h1 className="text-2xl block font-light text-gray-900 mb-2">Search Results {query && `for "${query}"`}</h1>
        <div className="flex gap-3 items-center text-sm">
          <Link
            href={"/"}
            className="text-gray-500 hover:text-gray-900  after:content-[''] after:w-1 after:h-2 after:ml-2 after:inline-block after:bg-no-repeat after:bg-center after:bg-[url('/icons/arrowIcon01.svg')] last:after:hidden"
          >
            Home
          </Link>
          <span className="text-gray-800">Search</span>
        </div>
        {query && !isSearchLoading && (
          <div className="text-sm text-gray-600 mt-2">
            {productList.length} result{productList.length !== 1 ? "s" : ""} found
          </div>
        )}
      </div>
      <div className="storeContainer flex flex-col">
        <div className="flex visible lg:hidden w-full mt-3 px-3 justify-between">
          <button
            className="border border-gray-200 rounded-md cursor-pointer pr-5 py-2 pl-8 bg-white text-gray-700 text-sm tracking-[1px] bg-[url('/icons/filterIcon.svg')] bg-no-repeat bg-[position:10px_center] transition-all duration-300 hover:bg-gray-100 hover:border-gray-300 active:bg-gray-200 active:border-gray-400"
            onClick={() => toggleFiltersWindow(true)}
          >
            FILTERS
          </button>
          <DropDownList data={sortDropdownData} width="180px" selectedIndex={sortIndex} onChange={handleSortChange} />
        </div>
        <div className="w-full flex pt-3 lg:mt-9 md:pt-2">
          <Filters
            onToggleWindow={toggleFiltersWindow}
            showFilters={showFilters}
            filters={filters}
            onFilterChange={setFilters}
            onBrandChange={handleBrandChange}
            isFilterChanged={isFilterChanged}
            onApplyFilter={handleApplyFilter}
            pageStatus={currentPageStatus}
          />
          <div className="flex-grow flex flex-col ml-0 2xl:ml-4 lg:ml-3">
            <div className="w-full items-center text-sm mb-5 ml-3 hidden lg:flex">
              <Image src={"/icons/sortIcon.svg"} alt="Sort" width={16} height={12} className="mr-3" />
              <span className="font-medium w-14 mr-3 text-gray-900">Sort By:</span>
              <LineList data={sortDropdownData} selectedId={sortIndex} onChange={handleSortChange} />
            </div>
            {pageStatusJSX}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
