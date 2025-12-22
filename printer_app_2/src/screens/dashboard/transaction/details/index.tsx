import TopBottomNav from "@/src/layouts/TopBottomNav";
import { Helper } from "@/src/utils/Helper";
import { ThemedText } from "@/src/widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import DeleteModal from "../list/DeleteModal";
import AppToast from "@/src/widgets/CustomToast";
import { deleteOfflineTransaction } from "@/src/database/services/transaction.service";
import { useRealm } from "@realm/react";
import { Button } from "@/components/ui/button";
import AppIcon from "@/src/components/AppIcon";
import { PrimaryButton } from "@/src/widgets/Button";
import { Grid, GridItem } from "@/components/ui/grid";

const TransactionDetails = () => {
  const [item, setItem] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const realm = useRealm();

  const { itemDetails, settings } = useSelector((State: any) => State.common);
  const { connected, address } = useSelector((state: any) => state.printer);

  const handleDelete = async (localId: string, products: any) => {
    setLoading(true);

    try {
      const deleted = await deleteOfflineTransaction(realm, localId, products);

      if (deleted) {
        setOpen(false);
        AppToast.success("Success!", "Transaction deleted successfully");
      } else {
        AppToast.error("Oops!", "Failed to delete transaction");
      }
    } catch (e) {
      console.error("Delete Error:11", e);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = async (isKOT: any = false) => {
    if (itemDetails?.products < 1) return AppToast.error("Oops!", "Must have 1 product to print");

    await Helper.printReceipt({ isKOT: isKOT, setIsLoading, address, data: itemDetails, realm, connected });
  };

  return (
    <TopBottomNav>
      <View className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 200, // 🔥 add bottom padding
            flexGrow: 1, // ensures ScrollView takes full height
          }}
        >
          {itemDetails?.syncStatus !== "deleted" && (
            <View className="flex flex-row justify-end mb-2 gap-3">
              <TouchableOpacity
                onPress={() => {
                  setItem(itemDetails);
                  setOpen(true);
                }}
              >
                <Ionicons name="trash-outline" size={22} className="text-error" />
              </TouchableOpacity>
            </View>
          )}
          <View className="w-full bg-base-200 relative rounded-lg p-4 shadow-md">
            {/* Images */}
            {/* Centered Overlapping Images */}
            <View className="absolute left-[55%] -translate-x-1/2 -top-6">
              {/* <View className="flex flex-row items-center">

                        {item.products.length > 3 && (
                          <View className="-ml-4">
                            <Avatar size="md" className="bg-white/50 justify-center items-center">
                              <AvatarFallbackText className="text-base-content-70">{"+ " + (item.products.length - 3)}</AvatarFallbackText>
                            </Avatar>
                          </View>
                        )}
                      </View> */}
            </View>

            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Receipt Number</ThemedText>
              <ThemedText className="capitalize">{itemDetails?.receiptNumber}</ThemedText>
            </View>
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Total Items</ThemedText>
              <ThemedText className="capitalize">{itemDetails?.products?.length}</ThemedText>
            </View>
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Total Amount</ThemedText>
              <ThemedText className="capitalize">{itemDetails?.total?.toLocaleString()}</ThemedText>
            </View>
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Created At</ThemedText>
              <ThemedText className="capitalize">{Helper.formatFullDate(itemDetails?.createdAt)}</ThemedText>
            </View>
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Updated At</ThemedText>
              <ThemedText className="capitalize">{Helper.formatFullDate(itemDetails?.updatedAt)}</ThemedText>
            </View>
          </View>

          <ThemedText className="text-lg mt-5 font-grotesk-semiBold mb-1">Products</ThemedText>

          <View className="bg-base-200 px-2">
            <View className="rounded-t-md border-b border-b-base-content-20 flex-row justify-between bg-base-200 py-2">
              <Grid className="gap-4" _extra={{ className: "grid-cols-4 " }}>
                <GridItem _extra={{ className: "col-span-2" }}>
                  <ThemedText className="capitalize font-grotes-bold text-left">Product Name</ThemedText>
                </GridItem>
                <GridItem _extra={{ className: "col-span-1" }}>
                  <ThemedText className="capitalize font-grotes-bold text-center">Quantity</ThemedText>
                </GridItem>
                <GridItem _extra={{ className: "col-span-1" }}>
                  <ThemedText className="capitalize font-grotes-bold text-right">Price</ThemedText>
                </GridItem>
              </Grid>
            </View>

            {itemDetails.products?.length > 0 &&
              itemDetails.products?.map((item: any, index: any) => (
                <View className="flex-row border-b border-b-base-content-20 justify-between bg-base-200 py-2" key={index}>
                  <Grid className="gap-4" _extra={{ className: "grid-cols-4 " }}>
                    <GridItem _extra={{ className: "col-span-2" }}>
                      <ThemedText className="capitalize text-left">{item.name}</ThemedText>
                    </GridItem>
                    <GridItem _extra={{ className: "col-span-1" }}>
                      <ThemedText className="capitalize text-center">{item.quantity}</ThemedText>
                    </GridItem>
                    <GridItem _extra={{ className: "col-span-1" }}>
                      <ThemedText className="capitalize text-right">{item.sellingPrice.toLocaleString()}</ThemedText>
                    </GridItem>
                  </Grid>
                </View>
              ))}
          </View>

          <View className=" mt-2 px-2">
            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Sub Total</ThemedText>
              <ThemedText className="capitalize">{itemDetails?.subtotal.toLocaleString()}</ThemedText>
            </View>
            {settings?.tax > 0 && (
              <View className="flex justify-between flex-row mb-2">
                <ThemedText>Tax %</ThemedText>
                <ThemedText className="capitalize">{itemDetails?.tax}</ThemedText>
              </View>
            )}

            <View className="flex justify-between flex-row mb-2">
              <ThemedText>Total</ThemedText>
              <ThemedText className="capitalize">{itemDetails?.total.toLocaleString()}</ThemedText>
            </View>
          </View>
        </ScrollView>

        {itemDetails?.syncStatus !== "deleted" && (
          <>
            <View className="absolute bottom-[60px] right-2">
              <Button
                size="lg"
                isDisabled={isLoading}
                className={`rounded-full p-3.5 w-[60px] h-[60px] flex-col gap-0 mb-1  border-2 border-black`}
                onPress={() => setOpen(true)}
              >
                <AppIcon name="cart" className="text-white" />
                <ThemedText className="text-primary-content font-grotesk-semiBold text-sm">Cart</ThemedText>
              </Button>
              {settings?.isKOT && (
                <Button
                  size="lg"
                  isDisabled={isLoading}
                  className={`rounded-full p-3.5 w-[60px] h-[60px] flex-col gap-0  border-2 border-black`}
                  onPress={() => printReceipt(true)}
                >
                  <AppIcon name="receipt" className="text-white" />
                  <ThemedText className="text-primary-content font-grotesk-semiBold text-sm">KOT</ThemedText>
                </Button>
              )}
            </View>
            <PrimaryButton
              title={`Quick Charge (${itemDetails.products?.length} item${itemDetails.products?.length > 1 ? "'s" : ""})`}
              onPress={() => printReceipt(false)}
              className="w-full absolute bottom-3"
              disabled={isLoading}
            />
          </>
        )}

        {open && (
          <DeleteModal
            showModal={open}
            setShowModal={setOpen}
            onConfirm={() => handleDelete(itemDetails?.localId, item.products)}
            isDeleting={loading}
          />
        )}
      </View>
    </TopBottomNav>
  );
};

export default TransactionDetails;
