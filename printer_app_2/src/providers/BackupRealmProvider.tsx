import React, { useEffect, useState } from "react";
import { Backup } from "../utils/helpers/backup";
import { Text } from "react-native";

import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { ThemedText } from "@/src/widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { setGAuth } from "../redux/slices/userSlice";
import { navigationRef } from "@/App";
import AppToast, { Toast } from "../widgets/CustomToast";
import { getLocalSettings } from "../database/services/settings.service";
import { Helper } from "../utils/Helper";
import { axiosInstance } from "../utils/axios";

const Modal1 = ({ showModal, setShowModal }: any) => {
  const [isLoading, setIsLoading] = useState<any>(null);
  const [progress, setProgress] = useState(0); // ✅ Add progress state

  const { user, GAuth } = useSelector((State: any) => State.user);
  const { settings } = useSelector((state: any) => state.common);

  const dispatch = useDispatch();

  const handleBackupFile = async () => {
    try {
      setIsLoading(true);
      const isOnline = await Helper.checkInternet();
      if (!isOnline) return;

      const expired = Backup.isTokenExpired(GAuth?.expiresAt);
      let res = { access_token: GAuth?.accessToken };

      if (expired) {
        const resBack = await axiosInstance.get("/auth/g-refresh-access-token");

        if (resBack?.data?.data?.access_token) {
          const expiresAt = Date.now() + resBack?.data?.data?.expires_in * 1000;

          res = { access_token: resBack?.data?.data?.access_token };

          dispatch(setGAuth({ expiresAt, accessToken: resBack?.data?.data?.access_token }));
        } else {
          navigationRef.navigate("BackupSettings");
          return;
        }
      }

      const gdrive = Backup.initGDrive(res?.access_token);

      const folderId = await Backup.getOrCreateBackupFolder(gdrive);

      const result: any = await Backup.uploadWithProgress(gdrive, folderId, (percent: any) => {
        if (percent > 0 && showModal) {
          setShowModal(false);
        }
        AppToast.progress(percent);
      });

      if (result?.id) {
        Toast.hide();
        AppToast.success("Backup Completed", "Your data is safely stored.");
        await AsyncStorage.setItem("lastBackupAt", Date.now().toString());

        // 🧹 DELETE OLD BACKUPS HERE
        try {
          await Backup.deleteOldBackups(gdrive, folderId);
        } catch (err) {}
      }
    } catch (error) {
      Toast.hide();
      AppToast.error("Backup Failed", "Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
      <ModalBackdrop />
      <ModalContent className="bg-base-200 border-base-content-20 rounded-lg">
        <ModalHeader>
          <ThemedText className="text-xl font-grotes-bold flex-row items-center">
            <Ionicons name="warning" size={22} className="text-yellow-300" style={{ marginRight: 6 }} /> Time to Backup
          </ThemedText>
          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-base-content-70" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <ThemedText className="mt-2">
            It looks like {settings?.backupNotice || 5} days have passed since your last backup.
            {"\n\n"}
            Backup to Google Drive now to protect your POS data from accidental loss or corruption.
          </ThemedText>
        </ModalBody>

        <ModalFooter className="flex flex-row justify-end gap-3 mb-2">
          {/* Cancel Button */}
          <TouchableOpacity onPress={() => setShowModal(false)} className="px-4 py-2 bg-error rounded-lg">
            <ThemedText className="text-error-content font-semibold">Later</ThemedText>
          </TouchableOpacity>

          {/* Confirm Delete Button */}
          <TouchableOpacity
            disabled={isLoading}
            onPress={handleBackupFile}
            className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? "bg-success/50" : "bg-success"}`}
          >
            <ThemedText className="text-primary-content font-semibold">Backup</ThemedText>
            {isLoading && <ActivityIndicator color="#fff" size="small" />}
          </TouchableOpacity>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const BackupRealmProvider = () => {
  const [showBackupWarning, setShowBackupWarning] = useState(false);
  const [backupDays, setBackupDays] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    async function checkBackup() {
      try {
        // 1️⃣ Get last backup timestamp
        const lastBackupAt = await AsyncStorage.getItem("lastBackupAt");
        if (!lastBackupAt) {
          setShowBackupWarning(true);
          return;
        }

        const lastBackupTime = Number(lastBackupAt);
        const now = Date.now();
        const diff = now - lastBackupTime;

        if (diff >= backupDays * 24 * 60 * 60 * 1000) {
          setShowBackupWarning(true);
        }
      } catch (error) {
        console.error("❌ checkBackup error:", error);
      }
    }

    // Run checkBackup AFTER 2 minutes
    timer = setTimeout(
      () => {
        checkBackup();
      },
      2 * 60 * 1000,
    );

    return () => clearTimeout(timer);
  }, []);

  return <Modal1 showModal={showBackupWarning} setShowModal={setShowBackupWarning} />;
};

export default BackupRealmProvider;
