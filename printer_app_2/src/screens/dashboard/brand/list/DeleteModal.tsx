import React from "react";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import { ThemedText } from "@/src/widgets/ThemeText";
import { Button } from "@/components/ui/button"; // or your custom button if you prefer
import Ionicons from "@react-native-vector-icons/ionicons";

const DeleteModal = ({ showModal, setShowModal, onConfirm, isDeleting }: any) => {
  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
      <ModalBackdrop />
      <ModalContent className="bg-base-200 border-base-content-20 rounded-lg">
        <ModalHeader>
          <ThemedText className="text-xl font-grotes-bold flex-row items-center">
            Delete <Ionicons name="trash-outline" size={22} className="text-error" style={{ marginLeft: 6 }} />
          </ThemedText>
          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-base-content-70" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <ThemedText className="text-base text-base-content-70">
            Are you sure you want to delete this brand? This action cannot be undone.
          </ThemedText>
        </ModalBody>

        <ModalFooter className="flex flex-row justify-end gap-3">
          {/* Cancel Button */}
          <TouchableOpacity onPress={() => setShowModal(false)} className="px-4 py-2 bg-error rounded-lg">
            <ThemedText className="text-error-content font-semibold">No</ThemedText>
          </TouchableOpacity>

          {/* Confirm Delete Button */}
          <TouchableOpacity
            disabled={isDeleting}
            onPress={onConfirm}
            className={`px-4 py-2 rounded-lg flex-row items-center ${isDeleting ? "bg-success/50" : "bg-success"}`}
          >
            <ThemedText className="text-primary-content font-semibold">Yes</ThemedText>
            {isDeleting && <ActivityIndicator color="#fff" size="small" />}
          </TouchableOpacity>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeleteModal;
