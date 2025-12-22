import React, { useState, useEffect } from "react";
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { ThemedText } from "@/src/widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Button } from "@/components/ui/button";

// Generate 30-min intervals (12-hour format)
const generateTimes = (ampm: "AM" | "PM") => {
  const times: string[] = [];
  for (let h = 1; h <= 12; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`);
    }
  }
  return times;
};

interface Props {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  onConfirm: (time: string) => void;
  type: "start" | "end";
}

const DaySEModal = ({ showModal, setShowModal, onConfirm, type }: Props) => {
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");

  // Reset AM/PM when modal opens
  useEffect(() => {
    if (showModal) setAmpm("AM");
  }, [showModal]);

  const times = generateTimes(ampm);

  const handleSelect = (time: string) => {
    onConfirm(time);
    setShowModal(false); // 🔥 auto close
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
      <ModalBackdrop />

      <ModalContent className="bg-base-200 border-base-content-20 rounded-lg">
        {/* Header */}
        <ModalHeader>
          <ThemedText className="text-xl font-grotes-bold flex-row items-center">
            <Ionicons name="time-outline" size={22} className="text-success" />
            {type === "start" ? " Select Day Start Time" : " Select Day End Time"}
          </ThemedText>

          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-base-content-70" />
          </ModalCloseButton>
        </ModalHeader>

        {/* Body */}
        <ModalBody>
          {/* AM / PM */}
          <View className="flex-row mt-2 mb-3">
            <Button variant={ampm === "AM" ? "solid" : "outline"} className="rounded-none flex-1" onPress={() => setAmpm("AM")}>
              <ThemedText>AM</ThemedText>
            </Button>

            <Button variant={ampm === "PM" ? "solid" : "outline"} className="rounded-none flex-1" onPress={() => setAmpm("PM")}>
              <ThemedText>PM</ThemedText>
            </Button>
          </View>

          {/* Time list */}
          <ScrollView style={{ maxHeight: 260 }}>
            {times.map(time => (
              <TouchableOpacity key={time} onPress={() => handleSelect(time)} className="px-4 py-3 rounded-md mb-1">
                <ThemedText className="text-center text-base-content-80">{time}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default DaySEModal;
