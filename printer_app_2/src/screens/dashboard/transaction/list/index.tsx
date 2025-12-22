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
import EditModal from "./EditModal";
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
import { deleteOfflineTransaction, getLocalTransactions } from "@/src/database/services/transaction.service";
import { Helper } from "@/src/utils/Helper";
import { Avatar, AvatarBadge, AvatarFallbackText, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import TopTabs from "@/src/screens/counter/TopTab";
import { Pressable } from "@/components/ui/pressable";

const PAGE_SIZE = 10;

const TransactionList = () => {
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
  const [activeTab, setActiveTab] = useState<"Bills" | "Deleted Bills">("Bills");

  const flatListRef = useRef<FlatList<any>>(null);

  // 🔥 Load from Realm (offline)
  const loadLocal = async (p = page, q = search) => {
    const status = activeTab === "Bills" ? "active" : "deleted";

    const res = await getLocalTransactions(realm, p, q, status);

    setData(res);
  };

  // Refresh = sync with server → read from realm
  const onRefresh = async () => {
    setRefreshing(true);
    // await fetchAndStoreServerCategories(realm);
    loadLocal(1, search);
    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    loadLocal(1, "");
  }, [activeTab]);

  // Search
  const debouncedSearch = useCallback(
    debounce(text => {
      setSearch(text);
      loadLocal(1, text);
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
    navigation.navigate("Bills Details");
  };

  const handleDelete = async (localId: string, products: any) => {
    setIsDeleteLoading(true);

    try {
      const deleted = await deleteOfflineTransaction(realm, localId, products);

      if (deleted) {
        setOpen(false);
        loadLocal(1, "");
        AppToast.success("Success!", "Transaction deleted successfully");
      } else {
        AppToast.error("Oops!", "Failed to delete transaction");
      }
    } catch (e) {
      console.error("Delete Error:11", e);
    }

    setIsDeleteLoading(false);
  };

  const renderItem = ({ item, index }: { item: any; index: any }) => {
    return (
      <GridItem key={item.localId || index} _extra={{ className: "col-span-1" }}>
        {/* Card */}
        <Pressable onPress={() => handleEdit(item)}>
          <View className="w-full bg-base-200 relative rounded-lg p-4 shadow-md">
            <View className="flex flex-row justify-between border-b pb-2 mb-4 border-b-base-content-20/40">
              <Text className="capitalize text-lg !text-base-content-2">id: {index + 1}</Text>

              {item.syncStatus !== "deleted" && (
                <View className="flex flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setItem(item);
                      setOpen(true);
                    }}
                  >
                    <Ionicons name="trash-outline" size={22} className="text-error" />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Images */}
            {/* Centered Overlapping Images */}
            {/* <View className="absolute left-[55%] -translate-x-1/2 -top-6">
                        <View className="flex flex-row items-center">
                          {item.products.slice(0, 3).map((p, idx) => (
                            <View key={idx} className={idx !== 0 ? "-ml-4" : ""}>
                              <Avatar size="md">
                                <AvatarFallbackText>{p.name}</AvatarFallbackText>
                                <AvatarImage source={{ uri: p.image }} />
                              </Avatar>
                            </View>
                          ))}

                          {item.products.length > 3 && (
                            <View className="-ml-4">
                              <Avatar size="md" className="bg-white/50 justify-center items-center">
                                <AvatarFallbackText className="text-base-content-70">
                                  {"+ " + (item.products.length - 3)}
                                </AvatarFallbackText>
                              </Avatar>
                            </View>
                          )}
                        </View>
                      </View> */}

            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Receipt Number</ThemedText>
              <ThemedText className="capitalize">{item.receiptNumber}</ThemedText>
            </View>
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Total Items</ThemedText>
              <ThemedText className="capitalize">{item.products?.length}</ThemedText>
            </View>
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Total Amount</ThemedText>
              <ThemedText className="capitalize">{item.total?.toLocaleString()}</ThemedText>
            </View>
            {item.syncStatus === "deleted" && (
              <View className="flex justify-between flex-row">
                <ThemedText className="capitalize">Status</ThemedText>

                <View className={`w-fit px-3 py-1 rounded-md border border-error/50 bg-error/15 mb-2`}>
                  <Text className={`text-error`}>{item.syncStatus}</Text>
                </View>
              </View>
            )}

            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Created At</ThemedText>
              <ThemedText className="capitalize">{Helper.formatFullDate(item.createdAt)}</ThemedText>
            </View>
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Updated At</ThemedText>
              <ThemedText className="capitalize">{Helper.formatFullDate(item.updatedAt)}</ThemedText>
            </View>
          </View>
        </Pressable>
      </GridItem>
    );
  };



  return (
    <TopBottomNav>
      <FlatList
        ref={flatListRef}
        data={data?.transactions || []}
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
              <ThemedText>No Bill Found</ThemedText>
            </View>
          ) : null
        }
        /* ✅ HEADER */
        ListHeaderComponent={
          <View className="mb-5">
            <View className="">
              <TopTabs tabs={["Bills", "Delete Bills"]} activeTab={activeTab} onTabPress={(tab: any) => setActiveTab(tab as any)} />
            </View>
            <CustomInput icon="search-outline" placeholder="Search" onChangeText={handleSearch} IconComponent={Ionicons} />
            <ThemedText className="relative top-4">Results: {data?.paginationData?.documentCount}</ThemedText>
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
        <DeleteModal
          showModal={open}
          setShowModal={setOpen}
          onConfirm={() => handleDelete(item?.localId, item?.products)}
          isDeleting={isDeleteLoading}
        />
      )}
    </TopBottomNav>
  );
};

export default TransactionList;
