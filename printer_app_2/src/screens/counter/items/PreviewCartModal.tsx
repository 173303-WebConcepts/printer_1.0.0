import React from "react";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/src/widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import { useSelector } from "react-redux";

const PreviewCartModal = ({ showModal, setShowModal, renderItem, data }: any) => {
  const { settings } = useSelector((State: any) => State.common);

  const totalAmount = data.reduce((t, i) => t + i.quantity * i.sellingPrice, 0);
  let taxAmount = 0;
  let payable = totalAmount;

  if (settings?.tax > 0) {
    taxAmount = totalAmount - totalAmount / (1 + settings.tax / 100);
    payable = totalAmount + taxAmount;
  }
  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="full">
      <ModalBackdrop />
      <ModalContent className="bg-base-100 border-base-content-20 rounded-lg h-full">
        <ModalHeader>
          <ThemedText className="text-xl font-grotes-bold flex-row items-center mb-5">
            Preview Cart <Ionicons name="cart-outline" size={22} className="text-success" style={{ marginLeft: 6 }} />
          </ThemedText>
          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-base-content-70" />
          </ModalCloseButton>
        </ModalHeader>

        <FlatList
          data={data || []}
          numColumns={3}
          keyExtractor={item => item.localId}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          columnWrapperStyle={{
            justifyContent: "space-between",
            marginBottom: 10,
          }}
          contentContainerStyle={{
            paddingBottom: 50, // 🔥 add bottom padding
            flexGrow: 1, // ensures the FlatList stretches even if content is small
          }}
          // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FD680D"]} />}
          ListEmptyComponent={() => (
            <View className="items-center mt-20">
              <ThemedText>No Product Found</ThemedText>
            </View>
          )}
          ListFooterComponent={
            <>
              <View className=" mt-2 bg-base-200 rounded-md p-3">
                <View className="flex justify-between flex-row mb-2">
                  <ThemedText>Sub Total</ThemedText>
                  <ThemedText className="capitalize">{totalAmount.toLocaleString()}</ThemedText>
                </View>
                {settings?.tax > 0 && (
                  <View className="flex justify-between flex-row mb-2">
                    <ThemedText>Tax %</ThemedText>
                    <ThemedText className="capitalize">{settings?.tax}</ThemedText>
                  </View>
                )}

                <View className="flex justify-between flex-row mb-2">
                  <ThemedText>Total</ThemedText>
                  <ThemedText className="capitalize">{payable.toLocaleString()}</ThemedText>
                </View>
              </View>
            </>
          }
        />

        {/* <ModalFooter className="flex flex-row justify-end gap-3">
          <TouchableOpacity onPress={() => setShowModal(false)} className="px-4 py-2 bg-error rounded-lg">
            <ThemedText className="text-error-content font-semibold">No</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isDeleting}
            onPress={onConfirm}
            className={`px-4 py-2 rounded-lg flex-row items-center ${isDeleting ? "bg-success/50" : "bg-success"}`}
          >
            <ThemedText className="text-primary-content font-semibold">Yes</ThemedText>
            {isDeleting && <ActivityIndicator color="#fff" size="small" />}
          </TouchableOpacity>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default PreviewCartModal;
