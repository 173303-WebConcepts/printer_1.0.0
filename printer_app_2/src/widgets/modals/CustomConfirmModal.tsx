import React from "react";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { ThemedText } from "@/src/widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Button } from "@/components/ui/button";
import { Text } from "react-native";

const CustomConfirmModal = ({ showModal, setShowModal, onConfirm, isLoading, title, des }: any) => {
  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
      <ModalBackdrop />
      <ModalContent className="bg-base-200 border-base-content-20 rounded-lg">
        <ModalHeader>
          <ThemedText className="text-xl font-grotes-bold flex-row items-center">{title}</ThemedText>
          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-base-content-70" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <ThemedText className="text-base text-base-content-70">{des}</ThemedText>
        </ModalBody>

        <ModalFooter className="flex flex-row justify-end gap-3">
          {/* Cancel Button */}
          <Button onPress={() => setShowModal(false)} variant="solid" className="bg-error">
            <Text className="text-white">No</Text>
          </Button>
          <Button isDisabled={isLoading} onPress={onConfirm} variant="solid" className="bg-success">
            <Text className="text-white">Confirm</Text>
            {isLoading && <ActivityIndicator color="#fff" size="small" />}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomConfirmModal;
