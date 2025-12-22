import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, RefreshControl, FlatList } from "react-native";
import { ThemedText } from "../../../widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import { PrimaryButton } from "../../../widgets/Button";
import AppIcon from "../../../components/AppIcon";
import CustomSelect from "@/src/widgets/CustomSelect";
import { Grid, GridItem } from "@/components/ui/grid";
import CustomInput from "@/src/widgets/CustomInput";
import { useDispatch, useSelector } from "react-redux";
import Pagination from "@/src/widgets/Pagination";
import { debounce } from "lodash";
import { getLocalProducts, getTopSellingProducts } from "@/src/database/services/productService";
import { useRealm } from "@realm/react";
import { getLocalCategories } from "@/src/database/services/category.service";
import { Button } from "@/components/ui/button";
import { Helper } from "@/src/utils/Helper";
import PreviewCartModal from "./PreviewCartModal";
import ItemCard from "./ItemCard";

const ITEM_HEIGHT = 170;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Burger",
    price: 1200,
    image: "https://img.icons8.com/color/200/000000/hamburger.png",
    quantity: 0,
  },
  {
    id: "2",
    name: "Pizza",
    price: 800,
    image: "https://img.icons8.com/color/200/000000/pizza.png",
    quantity: 0,
  },
  {
    id: "3",
    name: "French Fries",
    price: 1500,
    image: "https://img.icons8.com/color/200/000000/french-fries.png",
    quantity: 0,
  },
  {
    id: "5",
    name: "Sushi",
    price: 2000,
    image: "https://img.icons8.com/color/200/000000/sushi.png",
    quantity: 0,
  },
  {
    id: "6",
    name: "Ice Cream",
    price: 1100,
    image: "https://img.icons8.com/color/200/000000/ice-cream-cone.png",
    quantity: 0,
  },
  {
    id: "7",
    name: "Donut",
    price: 700,
    image: "https://img.icons8.com/color/200/000000/donut.png",
    quantity: 0,
  },
  {
    id: "8",
    name: "Taco",
    price: 950,
    image: "https://img.icons8.com/color/200/000000/taco.png",
    quantity: 0,
  },
  {
    id: "9",
    name: "Sandwich",
    price: 850,
    image: "https://img.icons8.com/color/200/000000/sandwich.png",
    quantity: 0,
  },
  {
    id: "10",
    name: "Cake",
    price: 1200,
    image: "https://img.icons8.com/color/200/000000/cake.png",
    quantity: 0,
  },
  {
    id: "11",
    name: "Pancakes",
    price: 1050,
    image: "https://img.icons8.com/color/200/000000/pancakes.png",
    quantity: 0,
  },
  {
    id: "12",
    name: "Coffee",
    price: 500,
    image: "https://img.icons8.com/color/200/000000/coffee.png",
    quantity: 0,
  },
];

export default function ItemsScreen({ activeTab }: any) {
  const [isLoading, setIsLoading] = useState<any>(false);
  const [isLoading1, setIsLoading1] = useState<any>(false);
  const [open, setOpen] = useState<any>(false);
  const [data, setData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  const flatListRef = useRef<FlatList<any>>(null);

  const realm = useRealm();
  const { connected, address } = useSelector((state: any) => state.printer);
  const { settings } = useSelector((state: any) => state.common);

  useEffect(() => {
    console.log("CC::22");
    loadLocal(1, "");
    loadLocal2();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadLocal(1, search, selectedCategory);
    }
  }, [selectedCategory]);

  // 🔥 Load from Realm (offline)
  const loadLocal = async (p = page, q = search, category?: any) => {
    setIsLoading(true);

    let res;

    if (activeTab === "Products") {
      res = await getLocalProducts(realm, p, q, 18, {
        isActive: true,
        categoryId: category || undefined,
      });
    } else {
      res = await getTopSellingProducts(realm, p, q, 18, {
        isActive: true,
        categoryId: category || undefined,
        range: "month",
      });
    }

    // ✅ Process Products
    const fetchedProducts =
      res?.products?.map((item: any) => {
        return {
          ...item,
          quantity: 0,
        };
      }) || [];

    setData({ products: fetchedProducts, paginationData: res.paginationData });
    setIsLoading(false);
  };

  const loadLocal2 = async () => {
    const res = await getLocalCategories(realm);

    // ✅ Process Categories
    const fetchedCategories =
      res?.categories?.map((c: any) => ({
        label: c.name,
        value: c.localId,
      })) || [];

    setCategories(fetchedCategories);
  };

  // Search
  const debouncedSearch = useCallback(
    debounce(text => {
      setSearch(text);
      loadLocal(1, text, selectedCategory);
      setPage(1);
    }, 700),
    [],
  );

  const handleSearch = (text: string) => debouncedSearch(text);

  // Pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadLocal(newPage, search, selectedCategory);

    // ✅ Scroll to top
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setSearch("");
      setSelectedCategory("");
      loadLocal(1, "");
      loadLocal2();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  const incrementQuantity = useCallback((id: string) => {
    setData((prev: any) => {
      if (!prev?.products) return prev;

      let changed = false;

      const updatedProducts = prev.products.map((p: any) => {
        if (p.localId !== id) return p;

        const maxStock = p.stock ?? p.currentStock ?? p.openingStock ?? 0;
        if (p.quantity >= maxStock) return p;

        changed = true;
        return { ...p, quantity: p.quantity + 1 };
      });

      return changed ? { ...prev, products: updatedProducts } : prev;
    });
  }, []);

  const decrementQuantity = useCallback((id: string) => {
    setData((prev: any) => {
      if (!prev?.products) return prev;

      let changed = false;

      const updatedProducts = prev.products.map((p: any) => {
        if (p.localId !== id) return p;
        if (p.quantity === 0) return p;

        changed = true;
        return { ...p, quantity: p.quantity - 1 };
      });

      return changed ? { ...prev, products: updatedProducts } : prev;
    });
  }, []);

  const resetQuantity = useCallback((id: string) => {
    setData((prev: any) => {
      if (!prev?.products) return prev;

      let changed = false;

      const updatedProducts = prev.products.map((p: any) => {
        if (p.localId !== id || p.quantity === 0) return p;

        changed = true;
        return { ...p, quantity: 0 };
      });

      return changed ? { ...prev, products: updatedProducts } : prev;
    });
  }, []);

  const renderItem = useCallback(
    ({ item, index }: any) => {
      const isLastInRow = (index + 1) % 3 === 0; // 3 = numColumns

      return (
        <ItemCard
          item={item}
          onInc={incrementQuantity}
          onDec={decrementQuantity}
          onReset={resetQuantity}
          isLastInRow={isLastInRow}
        />
      );
    },
    [incrementQuantity, decrementQuantity, resetQuantity],
  );

  const totalItems = data?.products.reduce((sum: any, p: any) => sum + p.quantity, 0);
  const items = data?.products?.filter((p: any) => p.quantity > 0) || [];

  const printReceipt = async (isKOT: any = false) => {
    await Helper.printReceipt({ isKOT: isKOT, setIsLoading: setIsLoading1, address, data, realm, connected });

    loadLocal(page, search, selectedCategory);
  };

  console.log("CC::11");

  return (
    <View className="flex-1 bg-base-100">
      <FlatList
        ref={flatListRef}
        data={data?.products || []}
        numColumns={3}
        keyExtractor={item => item.localId}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 10,
        }}
        contentContainerStyle={{
          paddingBottom: 50, // 🔥 add bottom padding
          flexGrow: 1, // ensures the FlatList stretches even if content is small
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FD680D"]} />}
        ListEmptyComponent={() =>
          !isLoading ? (
            <View className="items-center mt-20">
              <ThemedText>No Product Found</ThemedText>
            </View>
          ) : null
        }
        /* ✅ HEADER */
        ListHeaderComponent={
          <View>
            <View className="mb-2">
              <CustomInput icon="search-outline" placeholder="Search" onChangeText={handleSearch} IconComponent={Ionicons} />
            </View>

            <Grid className="gap-2 mb-4" _extra={{ className: "grid-cols-1" }}>
              <GridItem _extra={{ className: "col-span-1" }}>
                <CustomSelect
                  items={categories?.map((item: any) => ({
                    label: item.label,
                    value: item.value,
                  }))}
                  placeholder="e.g pizza"
                  icon="layers-outline"
                  value={selectedCategory}
                  onSelect={(val: any) => setSelectedCategory(val)}
                  navigationLink="Add Category"
                />
              </GridItem>
            </Grid>
          </View>
        }
        ListFooterComponent={
          <>
            {/* PAGINATION BELOW LIST */}
            {data?.paginationData?.totalPages > 1 && (
              <View className=" mb-10">
                <Pagination paginationData={data.paginationData} onPageChange={handlePageChange} />
              </View>
            )}
          </>
        }
      />

      {/* Quick Charge Button */}
      {totalItems > 0 && (
        <>
          <View className="absolute bottom-[60px] right-2">
            <Button
              size="lg"
              isDisabled={isLoading1}
              className={`rounded-full p-3.5 w-[60px] h-[60px] flex-col gap-0 mb-1  border-2 border-black`}
              onPress={() => setOpen(true)}
            >
              <AppIcon name="cart" className="text-white" />
              <ThemedText className="text-primary-content font-grotesk-semiBold text-sm">Cart</ThemedText>
            </Button>
            {settings?.isKOT && (
              <Button
                size="lg"
                isDisabled={isLoading1}
                className={`rounded-full p-3.5 w-[60px] h-[60px] flex-col gap-0  border-2 border-black`}
                onPress={() => printReceipt(true)}
              >
                <AppIcon name="receipt" className="text-white" />
                <ThemedText className="text-primary-content font-grotesk-semiBold text-sm">KOT</ThemedText>
              </Button>
            )}
          </View>

          <PrimaryButton
            title={`Quick Charge (${totalItems} item${totalItems > 1 ? "'s" : ""})`}
            onPress={() => printReceipt(false)}
            className="absolute bottom-3 w-full"
            disabled={isLoading1}
          />
        </>
      )}

      <PreviewCartModal showModal={open} setShowModal={setOpen} renderItem={renderItem} data={items} />
    </View>
  );
}
