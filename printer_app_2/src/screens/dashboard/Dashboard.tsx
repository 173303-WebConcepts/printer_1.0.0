import React, { useEffect, useState } from "react";
import { ThemedText } from "../../widgets/ThemeText";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import AppIcon from "@/src/components/AppIcon";
import { Helper } from "@/src/utils/Helper";
import { useDispatch, useSelector } from "react-redux";
import AppToast, { Toast } from "@/src/widgets/CustomToast";
import { PrimaryButton } from "@/src/widgets/Button";
import { Backup } from "@/src/utils/helpers/backup";
import { setGAuth } from "@/src/redux/slices/userSlice";
import { useNavigation } from "@react-navigation/native";
import { getRealmSize } from "@/src/database/realmInstance";
import { Pressable } from "@/components/ui/pressable";
import { getEarningStats } from "@/src/database/services/transaction.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { axiosInstance } from "@/src/utils/axios";

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [show, setShow] = useState<boolean>(true); // ✅ Add progress state
  const [wallet, setWallet] = useState<any>(null); // ✅ Add progress state

  const { user, GAuth } = useSelector((State: any) => State.user);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const load = async () => {
    const data = await getEarningStats();

    setWallet(data);
  };

  useEffect(() => {
    load();
  }, []);

  // Refresh = sync with server → read from realm
  const onRefresh = async () => {
    setRefreshing(true);
    // await fetchAndStoreServerCategories(realm);

    setRefreshing(false);
  };

  const retoreBackup = async () => {
    const isOnline = await Helper.checkInternet();

    if (!isOnline) return;

    const expired = Backup.isTokenExpired(GAuth?.expiresAt);
    let res = { access_token: GAuth?.accessToken };

    if (expired) {
      console.log("KK::11", expired)
      res = await Backup.refreshAccessToken(user?.GRefreshToken); // you must implement this

      if (res?.access_token) {
        const expiresAt = Date.now() + res?.expires_in * 1000;

        dispatch(setGAuth({ expiresAt, accessToken: res?.access_token }));
      } else {
        navigation.navigate("BackupSettings");
        return;
      }
    }

    console.log("KK::22")

    const gdrive = Backup.initGDrive(res?.access_token);

    const folderId = await Backup.getOrCreateBackupFolder(gdrive);

    await Backup.restoreLatestBackup(gdrive, folderId);
  };

  //   const retoreBackup = async () => {
  //   try {
  //     const expired = await Backup.isTokenExpired(GAuth?.expiresAt);
  //     if (expired) {
  //       const res = await Backup.refreshAccessToken(user?.GRefreshToken);
  //       if (res?.access_token) {
  //         const expiresAt = Date.now() + res?.expires_in * 1000;
  //         dispatch(setGAuth({ expiresAt, accessToken: res?.access_token }));
  //       } else {
  //         navigation.navigate("BackupSettings");
  //         return;
  //       }
  //     }

  //     const gdrive = Backup.initGDrive(GAuth?.accessToken);
  //     const folderId = await Backup.getOrCreateBackupFolder(gdrive);

  //     const success = await Backup.restoreLatestBackup(gdrive, folderId);

  //     if (success) {
  //       console.log("Restore completed.");
  //     }
  //   } catch (err) {
  //     console.error("Restore error:", err);
  //     AppToast.error("Restore Failed", "Something went wrong");
  //   }
  // };

  const handleBackup = async () => {
    try {
      // setIsLoading(true);
      const isOnline = await Helper.checkInternet();
      if (!isOnline) return;

      const expired = Backup.isTokenExpired(GAuth?.expiresAt);

      let res = { access_token: GAuth?.accessToken };

      if (expired) {
        console.log("KK::11", expired)
        const resBack = await axiosInstance.get("/auth/g-refresh-access-token");

        if (resBack?.data?.data?.access_token) {
          const expiresAt = Date.now() + resBack?.data?.data?.expires_in * 1000;

          res = { access_token: resBack?.data?.data?.access_token };

          dispatch(setGAuth({ expiresAt, accessToken: resBack?.data?.data?.access_token }));
        } else {
          navigation.navigate("BackupSettings");
          return;
        }
      }

       console.log("KK::22", expired)

      const gdrive = Backup.initGDrive(res?.access_token);

      const folderId = await Backup.getOrCreateBackupFolder(gdrive);

      const result: any = await Backup.uploadWithProgress(gdrive, folderId, (percent: any) => {
        AppToast.progress(percent, "Uploading Backup");
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
    }
  };

  return (
    <TopBottomNav>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FD680D"]} tintColor="#FD680D" />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50, // 🔥 add bottom padding
          flexGrow: 1, // ensures ScrollView takes full height
        }}
      >
        <View className="bg-primary rounded-2xl p-5 shadow-lg">
          <View className="flex-row justify-between">
            <ThemedText className="text-lg font-grotes-bold mb-4 text-black">Wallet Summary</ThemedText>

            <Pressable onPress={() => setShow(!show)}>
              {show ? <AppIcon name="eye-off" className="text-black" /> : <AppIcon name="eye" className="text-black" />}
            </Pressable>
          </View>

          {/* Today */}
          <View className="flex-row justify-between py-2">
            <ThemedText className="text-black">Today Earning</ThemedText>
            <ThemedText className="text-black">{show ? wallet?.todayEarning?.toLocaleString() : "****"}</ThemedText>
          </View>

          <View className="h-[0.5px] bg-black my-1"></View>

          {/* Month */}
          <View className="flex-row justify-between py-2">
            <ThemedText className="text-black">This Month</ThemedText>
            <ThemedText className="text-black">{show ? wallet?.monthEarning?.toLocaleString() : "******"}</ThemedText>
          </View>

          <View className="h-[0.5px] bg-black my-1"></View>

          {/* Year */}
          <View className="flex-row justify-between py-2">
            <ThemedText className="text-black">This Year</ThemedText>
            <ThemedText className="text-black">{show ? wallet?.yearEarning?.toLocaleString() : "********"}</ThemedText>
          </View>
        </View>

        {/* <PrimaryButton title="Count increase" className="mt-5" onPress={Backup.increaseWriteCounter} /> */}
        {/* <PrimaryButton title="Backup file / delete file" className="mt-5" onPress={handleBackup} />
        <PrimaryButton title="Restore latest backup" className="mt-5" onPress={retoreBackup} /> */}
      </ScrollView>
    </TopBottomNav>
  );
}
