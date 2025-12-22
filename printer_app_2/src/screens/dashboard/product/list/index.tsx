import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { ScrollView, View, Text, TouchableOpacity, Image, RefreshControl, FlatList } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import { debounce } from "lodash";
import { axiosInstance } from "@/src/utils/axios";
import { Spinner } from "@/components/ui/spinner";
import { Button, ButtonText } from "@/components/ui/button";
import CustomInput from "@/src/widgets/CustomInput";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedText } from "@/src/widgets/ThemeText";
import DeleteModal from "./DeleteModal";
import AppIcon from "@/src/components/AppIcon";
import Pagination from "@/src/widgets/Pagination";
import { useNavigation } from "@react-navigation/native";
import { Grid, GridItem } from "@/components/ui/grid";
import { useDispatch } from "react-redux";
import { setItemDetails } from "@/src/redux/slices/commonSlice";
import { useRealm } from "@realm/react";
import { Constant } from "@/src/utils/Constant";
import { deleteOfflineProduct, getLocalProducts, syncProductsToServer } from "@/src/database/services/productService";
import AppToast from "@/src/widgets/CustomToast";
import { Helper } from "@/src/utils/Helper";
import RealmImage from "@/src/widgets/RealmImage";
import CustomSelect from "@/src/widgets/CustomSelect";
import { getLocalCategories } from "@/src/database/services/category.service";

const PAGE_SIZE = 10;

const ProductList = () => {
  const realm = useRealm();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [offlineProducts, setOfflineProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, documentCount: 0 });

  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [item, setItem] = useState<any>({});
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const flatListRef = useRef<FlatList<any>>(null);

  // 🔥 Load from Realm (offline)
  const loadLocal = async (p = page, q = search, category?: any) => {
    const res = await getLocalProducts(realm, p, q, 10, {
      categoryId: category || undefined,
    });
    // Convert Realm Results → plain array of JS objects
    const products = res.products.map((pro: any) => pro);

    setData({
      products,
      paginationData: res.paginationData,
    });
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

  // Refresh = sync with server → read from realm
  const onRefresh = async () => {
    setRefreshing(true);
    // await fetchAndStoreServerCategories(realm);
    loadLocal(1, search);
    loadLocal2();
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    loadLocal(1, "");
    loadLocal2();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadLocal(1, search, selectedCategory);
    }
  }, [selectedCategory]);

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
    loadLocal(newPage, search);

    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  // -------- Edit / Delete --------
  const handleEdit = (item: any) => {
    dispatch(setItemDetails(item));
    navigation.navigate("Edit Product");
  };

  const handleDelete = async (localId: string) => {
    setIsDeleteLoading(true);

    try {
      const deleted = await deleteOfflineProduct(realm, localId);

      if (deleted) {
        setOpen(false);
        loadLocal(1, "");
        AppToast.success("Success!", "Product deleted successfully");
      } else {
        AppToast.error("Oops!", "Failed to product category");
      }
    } catch (e) {
      console.error("Delete Error:11", e);
    }

    setIsDeleteLoading(false);
  };

  const renderItem = ({ item, index }: { item: any; index: any }) => {
    return (
      <GridItem key={item.localId || index} _extra={{ className: "col-span-1" }}>
        <View className="w-full bg-base-200 relative rounded-lg p-4 shadow-md">
          <View className="flex flex-row justify-between border-b pb-2 mb-4 border-b-base-content-20/40">
            <Text className="capitalize text-lg !text-base-content-2">id: {index + 1}</Text>
            <View className="flex flex-row gap-3">
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons name="create-outline" className="text-info" size={22} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setItem(item);
                  setOpen(true);
                }}
              >
                <Ionicons name="trash-outline" size={22} className="text-error" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image */}
          <View className="items-center absolute left-[40%] -top-11">
            <RealmImage
              binary={item.image?.binary}
              mimeType={item.image?.mimeType}
              className="rounded-full w-[80px] h-[80px] border-2 border-base-content-20"
            />
          </View>

          <View className="flex justify-between flex-row mb-2">
            <ThemedText>Name</ThemedText>
            <ThemedText className="capitalize">{item.name}</ThemedText>
          </View>
          <View className="flex justify-between flex-row mb-2">
            <ThemedText>Purchase Price</ThemedText>
            <ThemedText>{item.purchasePrice}</ThemedText>
          </View>
          <View className="flex justify-between flex-row mb-2">
            <ThemedText>Selling Price</ThemedText>
            <ThemedText>{item.sellingPrice}</ThemedText>
          </View>
          <View className="flex justify-between flex-row mb-2">
            <ThemedText>Stock</ThemedText>
            <ThemedText>{item.stock}</ThemedText>
          </View>
          <View className="flex justify-between flex-row mb-2">
            <ThemedText>Unit</ThemedText>
            <ThemedText>{item.unit?.label}</ThemedText>
          </View>
          {item.categoryId && (
            <View className="flex justify-between flex-row">
              <ThemedText className="capitalize">Category</ThemedText>

              <View className={`w-fit px-3 py-1 rounded-md border border-info/50 bg-info/15 mb-2`}>
                <Text className={`text-info`}>{item.categoryId?.name || item.categoryId?.label}</Text>
              </View>
            </View>
          )}

          <View className="flex justify-between flex-row mb-2">
            <ThemedText>Is Active</ThemedText>
            <View
              className={`w-fit px-3 py-1 rounded-md border ${item.isActive ? "border-success/50 bg-success/15" : "border-error/50 bg-error/15"}`}
            >
              <Text className={`${item.isActive ? "text-success" : "text-error"}`}>{item.isActive ? "Yes" : "No"}</Text>
            </View>
          </View>

          {!isOnline && (
            <View className="flex justify-between flex-row">
              <ThemedText>Sync Status</ThemedText>
              <View
                className={`w-fit px-3 py-1 rounded-md border ${item.syncStatus === "pending" ? "border-error/50 bg-error/15" : "border-error/50 bg-error/15"}`}
              >
                <Text className={`${item.syncStatus === "pending" ? "text-error" : "text-error"}`}>{item.syncStatus}</Text>
              </View>
            </View>
          )}
        </View>
      </GridItem>
    );
  };

  return (
    <TopBottomNav>
      <FlatList
        ref={flatListRef}
        data={data?.products || []}
        numColumns={1}
        keyExtractor={item => item.localId}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FD680D"]} />}
        contentContainerStyle={{
          paddingBottom: 50, // 🔥 add bottom padding
          flexGrow: 1, // ensures the FlatList stretches even if content is small
        }}
        ListEmptyComponent={() =>
          !loading ? (
            <View className="items-center mt-20">
              <ThemedText>No Product Found</ThemedText>
            </View>
          ) : null
        }
        /* ✅ HEADER */
        ListHeaderComponent={
          <View className="mb-8">
            <View className="flex-row justify-end mb-4">
              <Button variant="solid" size={"sm"} className="w-fit" onPress={() => navigation.navigate("Add Product")}>
                <AppIcon name="add-circle" className="text-white text-xl" />
                <ButtonText>Add Product</ButtonText>
              </Button>
            </View>
            <CustomInput icon="search-outline" placeholder="Search" onChangeText={handleSearch} IconComponent={Ionicons} className="mb-2" />
            {categories?.length > 0 && (
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
            )}

            <ThemedText className="relative top-6">Results: {data?.paginationData?.documentCount}</ThemedText>
          </View>
        }
        ListFooterComponent={
          <>
            {/* PAGINATION BELOW LIST */}
            {data?.paginationData?.totalPages > 1 && (
              <View className="">
                <Pagination paginationData={data.paginationData} onPageChange={handlePageChange} />
              </View>
            )}
          </>
        }
      />

      {open && (
        <DeleteModal showModal={open} setShowModal={setOpen} onConfirm={() => handleDelete(item?.localId)} isDeleting={isDeleteLoading} />
      )}
    </TopBottomNav>
  );
};

export default ProductList;
