import React, { useEffect, useState, useCallback, useRef } from "react";
import { ScrollView, View, RefreshControl, TouchableOpacity } from "react-native";
import { debounce } from "lodash";
import { Spinner } from "@/components/ui/spinner";
import CustomInput from "@/src/widgets/CustomInput";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedText } from "@/src/widgets/ThemeText";
import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import Pagination from "@/src/widgets/Pagination";
import { useRealm } from "@realm/react";
import { deleteOfflineCategory, getLocalCategories, updateOfflineCategory } from "@/src/database/services/category.service";
import AppToast from "@/src/widgets/CustomToast";
import { Button, ButtonText } from "@/components/ui/button";
import AppIcon from "@/src/components/AppIcon";
import { useNavigation } from "@react-navigation/native";

const CategoryList = () => {
  const realm = useRealm();
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [item, setItem] = useState<any>({});

  const scrollRef = useRef<ScrollView>(null);

  const navigation = useNavigation<any>();

  const loadLocal = async (p = page, q = search) => {
    const res = await getLocalCategories(realm, p, q);

    // Convert Realm Results → plain array of JS objects
    const categories = res.categories.map((cat: any) => cat.toJSON());

    setData({
      categories,
      paginationData: res.paginationData,
    });
  };

  // Refresh = sync with server → read from realm
  const onRefresh = async () => {
    setRefreshing(true);
    loadLocal(1, search);

    setRefreshing(false);
  };

  // Initial load
  useEffect(() => {
    loadLocal(1, "");
  }, []);

  // Search
  const debouncedSearch = useCallback(
    debounce(text => {
      setSearch(text);
      loadLocal(1, text);
      setPage(1);

      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }, 700),
    [],
  );

  const handleSearch = (text: string) => debouncedSearch(text);

  // Pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadLocal(newPage, search);

    // 👇 scroll to top
    scrollRef.current?.scrollTo({
      y: 0,
      animated: true,
    });
  };

  const handleEditClick = (category: any) => {
    if (category.shopType) {
      return AppToast.error("Oops", "You can't edit category created by admin.");
    }

    setOpen1(true);
    setItem(category);
  };

  const handleDelete = async (localId: string) => {
    setIsDeleteLoading(true);

    try {

      const deleted = await deleteOfflineCategory(realm, localId);


      if (deleted) {

        setOpen(false);

        loadLocal(1, "");
        AppToast.success("Success!", "Category deleted successfully");
      } else {
        AppToast.error("Oops!", "Failed to delete category");
      }
    } catch (e) {
      console.error("Delete Error:11", e);
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handleEdit = async (localId: string, values: any) => {
    setIsDeleteLoading(true);

    try {
      const updated = await updateOfflineCategory(realm, localId, values.name);

      if (updated) {
        setOpen1(false);
        loadLocal(1, "");
        AppToast.success("Success!", "Category updated successfully");
      } else {
        AppToast.error("Oops!", "Failed to updated category");
      }
    } catch (e) {
      console.error("Delete Error:11", e);
    }

    setIsDeleteLoading(false);
  };

  return (
    <TopBottomNav>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FD680D"]} tintColor="#FD680D" />}
        contentContainerStyle={{
          paddingBottom: 50, // 🔥 add bottom padding
          flexGrow: 1, // ensures ScrollView takes full height
        }}
      >
        <View className="flex-row justify-end">
          <Button variant="solid" size={"sm"} className="w-fit" onPress={() => navigation.navigate("Add Category")}>
            <AppIcon name="add-circle" className="text-white text-xl" />
            <ButtonText>Add Category</ButtonText>
          </Button>
        </View>

        <View className="mt-2">
          <CustomInput icon="search-outline" placeholder="Search" onChangeText={handleSearch} IconComponent={Ionicons} />
        </View>

        {!loading && data?.categories?.length > 0 && (
          <ThemedText className="mt-4">Results: {data?.paginationData?.documentCount}</ThemedText>
        )}

        {loading ? (
          <View className="py-20 items-center">
            <Spinner size="large" />
          </View>
        ) : data?.categories?.length > 0 ? (
          <View className="flex flex-row flex-wrap">
            {data.categories.map((cat: any) => (
              <View key={cat?.localId} className="mb-1 w-full bg-base-200 border flex flex-row justify-between  rounded-lg p-4 shadow-md">
                <View className="mt-2">
                  <ThemedText className="capitalize text-lg">{cat?.name}</ThemedText>
                </View>
                <View className="flex flex-row justify-end items-end">
                  <View className="flex flex-row gap-3">
                    <TouchableOpacity onPress={() => handleEditClick(cat)}>
                      <Ionicons name="create-outline" size={22} className={` ${cat?.shopType ? "text-info/50" : "text-info"}`} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setItem(cat);
                        setOpen(true);
                      }}
                    >
                      <Ionicons name="trash-outline" size={22} className="text-error" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="py-10 items-center">
            <ThemedText>No Categories Found</ThemedText>
          </View>
        )}

        {/* Pagination */}
        {data?.paginationData?.totalPages > 1 && <Pagination paginationData={data.paginationData} onPageChange={handlePageChange} />}
      </ScrollView>

      {open && (
        <DeleteModal showModal={open} setShowModal={setOpen} isDeleting={isDeleteLoading} onConfirm={() => handleDelete(item?.localId)} />
      )}
      {open1 && (
        <EditModal
          showModal={open1}
          setShowModal={setOpen1}
          item={item}
          isDeleting={isDeleteLoading}
          onConfirm={(values: any) => handleEdit(item?.localId, values)}
        />
      )}
    </TopBottomNav>
  );
};

export default CategoryList;
