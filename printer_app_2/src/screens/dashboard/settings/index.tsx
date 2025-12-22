import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { Button } from "@/components/ui/button";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import CustomSwitch from "@/src/widgets/CustomSwitch";
import { ThemedText } from "@/src/widgets/ThemeText";
import DaySEModal from "./DaySEModal";
import { createOfflineSettings, getLocalSettings, updateOfflineSettings } from "@/src/database/services/settings.service";
import { useDispatch, useSelector } from "react-redux";
import { setSettings } from "@/src/redux/slices/commonSlice";

// ---------- helpers ----------
const formatTime = (time?: string) => time ?? "--:--";

const Settings = () => {
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [currentPicker, setCurrentPicker] = useState<"start" | "end">("start");

  const dispatch = useDispatch();

  const { settings } = useSelector((state: any) => state.common);

  // ======================================================
  // 2️⃣ UPDATE HANDLERS (AUTO SAVE)
  // ======================================================
  const toggleKOT = (value: boolean) => {
    dispatch(setSettings({ ...settings, isKOT: value }));
    updateOfflineSettings({ isKOT: value });
  };

  const toggleTokenNumber = (value: boolean) => {
    dispatch(setSettings({ ...settings, isTokenNumber: value }));
    updateOfflineSettings({ isTokenNumber: value });
  };

  const incrementBackup = () => {
    if (settings?.backupNotice >= 10) return;
    const val = settings?.backupNotice + 1;
    dispatch(setSettings({ ...settings, backupNotice: val }));
    updateOfflineSettings({ backupNotice: val });
  };

  const decrementBackup = () => {
    if (settings?.backupNotice <= 1) return;
    const val = settings?.backupNotice - 1;
    dispatch(setSettings({ ...settings, backupNotice: val }));
    updateOfflineSettings({ backupNotice: val });
  };

  const incrementTax = () => {
    if (settings?.tax >= 60) return;
    const val = settings?.tax + 1;
    dispatch(setSettings({ ...settings, tax: val }));
    updateOfflineSettings({ tax: val });
  };

  const decrementTax = () => {
    if (settings?.tax <= 0) return;
    const val = settings?.tax - 1;
    dispatch(setSettings({ ...settings, tax: val }));
    updateOfflineSettings({ tax: val });
  };

  const openPicker = (type: "start" | "end") => {
    setCurrentPicker(type);
    setShowModal(true);
  };

  const onConfirmTime = (time: string) => {
    if (currentPicker === "start") {
      dispatch(setSettings({ ...settings, dayStart: time }));
      updateOfflineSettings({ dayStart: time });
    } else {
      dispatch(setSettings({ ...settings, dayEnd: time }));
      updateOfflineSettings({ dayEnd: time });
    }
  };

  // ======================================================
  // UI
  // ======================================================
  return (
    <TopBottomNav>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50, // 🔥 add bottom padding
          flexGrow: 1, // ensures ScrollView takes full height
        }}
      >
        {/* KOT */}
        <View className="mb-3">
          <CustomSwitch value={settings?.isKOT} onToggle={toggleKOT} label="Kitchen Order Token (KOT) Option" />
        </View>

        {/* Token Number */}
        <View className="mb-5">
          <CustomSwitch value={settings?.isTokenNumber} onToggle={toggleTokenNumber} label="Show Token Number On Receipt" />
        </View>

        {/* Backup Days */}
        <View className="mb-5">
          <HStack justifyContent="space-between" alignItems="center" padding="md">
            <ThemedText>Backup Notice After (Days)</ThemedText>
            <HStack space="sm" alignItems="center">
              <Button size="sm" onPress={decrementBackup}>
                <ThemedText>-</ThemedText>
              </Button>
              <ThemedText style={{ width: 24, textAlign: "center" }}>{settings?.backupNotice}</ThemedText>
              <Button size="sm" onPress={incrementBackup}>
                <ThemedText>+</ThemedText>
              </Button>
            </HStack>
          </HStack>
        </View>

        {/* Tax */}
        <View className="mb-5">
          <HStack justifyContent="space-between" alignItems="center" padding="md">
            <ThemedText>Tax %</ThemedText>
            <HStack space="sm" alignItems="center">
              <Button size="sm" onPress={decrementTax}>
                <ThemedText>-</ThemedText>
              </Button>
              <ThemedText style={{ width: 24, textAlign: "center" }}>{settings?.tax}</ThemedText>
              <Button size="sm" onPress={incrementTax}>
                <ThemedText>+</ThemedText>
              </Button>
            </HStack>
          </HStack>
        </View>

        {/* Day Start / End */}
        <View className="mb-5">
          <HStack className="mb-2" justifyContent="space-between" alignItems="center" padding="md">
            <ThemedText>Day Start</ThemedText>
            <Button size="sm" variant="outline" onPress={() => openPicker("start")}>
              <ThemedText>{formatTime(settings?.dayStart)}</ThemedText>
            </Button>
          </HStack>

          <HStack justifyContent="space-between" alignItems="center" padding="md">
            <ThemedText>Day End</ThemedText>
            <Button size="sm" variant="outline" onPress={() => openPicker("end")}>
              <ThemedText>{formatTime(settings?.dayEnd)}</ThemedText>
            </Button>
          </HStack>
        </View>

        {/* Modal */}
        {showModal && <DaySEModal showModal={showModal} setShowModal={setShowModal} type={currentPicker} onConfirm={onConfirmTime} />}
      </ScrollView>
    </TopBottomNav>
  );
};

export default Settings;
