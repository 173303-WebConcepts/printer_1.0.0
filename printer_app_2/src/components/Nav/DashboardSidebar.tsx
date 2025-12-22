import { Drawer, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, DrawerCloseButton } from "@/components/ui/drawer";
import { Button, ButtonText } from "@/components/ui/button";

import { Pressable, ScrollView, View } from "react-native";
import { ThemedText } from "@/src/widgets/ThemeText";
import AppIcon from "../AppIcon";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Grid } from "@/components/ui/grid";
import { useNavigation, useRoute } from "@react-navigation/native";
import { PrimaryButton } from "@/src/widgets/Button";
import { axiosInstance } from "@/src/utils/axios";
import { Helper } from "@/src/utils/Helper";
import { useState } from "react";
import { setGAuth, setUser } from "@/src/redux/slices/userSlice";
import { useDispatch, useSelector } from "react-redux";
import { currentRouteName, navigationRef } from "@/App";
import ProfileD from "./ProfileD";
import { Backup } from "@/src/utils/helpers/backup";
import { Spinner } from "@/components/ui/spinner";
import CustomConfirmModal from "@/src/widgets/modals/CustomConfirmModal";

const Nav = [
  {
    label: "Category",
    children: [
      {
        title: "Categories",
        iconName: "list-outline",
        route: "Category List",
      },
      {
        title: "Add Category",
        iconName: "layers-outline",
        route: "Add Category",
      },
    ],
  },
  {
    label: "Product",
    children: [
      {
        title: "Products",
        iconName: "list-outline",
        route: "Product List",
      },
      {
        title: "Add Product",
        iconName: "bag-add-outline",
        route: "Add Product",
      },
    ],
  },
  {
    label: "Bill",
    children: [
      {
        title: "Bills",
        iconName: "list-outline",
        route: "Bill List",
      },
    ],
  },
  {
    label: "Others",
    children: [
      {
        title: "Change PIN",
        iconName: "pin",
        route: "Change PIN",
      },
    ],
  },
];

const NavItem = ({ title, onPress, isActive, iconName }: any) => {
  return (
    <Pressable onPress={onPress} className="flex-col items-center">
      <View className={`py-3 px-4 w-fit rounded-lg bg-base-300 ${isActive ? "border border-primary" : ""}`}>
        <AppIcon IconComponent={Ionicons} name={iconName} size={28} className={`${isActive ? "!text-primary" : ""}`} />
      </View>

      <ThemedText className={`mt-2 text-sm text-center ${isActive ? "text-primary" : "text-base-content"}`}>{title}</ThemedText>
    </Pressable>
  );
};

const DashboardSidebar = ({ showDrawer, setShowDrawer }: any) => {
  // const navigation = useNavigation<any>();
  // const route = useRoute();
  const [isLoading, setIsLoading] = useState<any>(null);
  const [isLoading1, setIsLoading1] = useState<any>(null);
  const [show, setShow] = useState<any>(false);

  const dispatch = useDispatch();
  const { user, GAuth } = useSelector((State: any) => State.user);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const isOnline = await Helper.checkInternet();
      if (!isOnline) return;

      const res = await axiosInstance.post("/auth/logout");
      if (res?.data?.success) {
        setShowDrawer(false);
        dispatch(setUser({ user: null }));
        navigationRef.navigate("Login");
      }
      Helper.res(res);
    } catch (error) {
      Helper.res(error);
    } finally {
      setIsLoading(false);
    }
  };

  const retoreBackup = async () => {
    try {
      setIsLoading1(true);

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

      await Backup.restoreLatestBackup(gdrive, folderId, setShowDrawer);
    } catch (error) {
    } finally {
      setIsLoading1(false);
    }
  };

  return (
    <Drawer
      isOpen={showDrawer}
      size="lg"
      anchor="left"
      onClose={() => {
        setShowDrawer(false);
      }}
    >
      <DrawerBackdrop />
      <DrawerContent className="bg-base-200 border-r-base-content-20">
        {/* Header */}
        <DrawerHeader>
          <DrawerCloseButton className="items-end w-full">
            <AppIcon IconComponent={Ionicons} name="close-outline" size={20} />
          </DrawerCloseButton>
        </DrawerHeader>

        {/* Body  */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 50, // 🔥 add bottom padding
            flexGrow: 1, // ensures ScrollView takes full height
          }}
        >
          <DrawerBody>
            <ProfileD setShowDrawer={setShowDrawer} />

            {Nav.map((item: any) => (
              <View key={item.label}>
                <ThemedText className="font-grotes-bold text-xl mt-5">{item.label}</ThemedText>

                <Grid
                  className="gap-5 mt-2"
                  _extra={{
                    className: "grid-cols-3",
                  }}
                >
                  {item.children.map((child: any) => (
                    <NavItem
                      key={child.route}
                      iconName={child.iconName}
                      title={child.title}
                      isActive={currentRouteName === child.route}
                      onPress={() => {
                        setShowDrawer(false);
                        navigationRef.navigate(child.route);
                      }}
                    />
                  ))}
                </Grid>
              </View>
            ))}
            <Grid
              className="gap-5 mt-5"
              _extra={{
                className: "grid-cols-3",
              }}
            >
              <Pressable
                onPress={() => {
                  setShow(true);
                }}
                className="flex-col items-center"
                disabled={isLoading1}
              >
                <View className={`py-3 px-4 w-fit rounded-lg bg-base-300 ${isLoading1 ? "border border-primary/50 py-4 px-5" : ""}`}>
                  {isLoading1 ? (
                    <Spinner className="text-[28px]" />
                  ) : (
                    <AppIcon IconComponent={Ionicons} name={"git-compare-outline"} size={28} />
                  )}
                </View>

                <ThemedText className={`mt-2 text-sm text-center `}>{"Restore\nDatabase"}</ThemedText>
              </Pressable>
            </Grid>
          </DrawerBody>
        </ScrollView>

        {/* Footer  */}
        <DrawerFooter>
          <PrimaryButton title="Logout" onPress={handleSubmit} className="w-full absolute bottom-0" disabled={isLoading} />
        </DrawerFooter>
      </DrawerContent>

      {show && (
        <CustomConfirmModal
          showModal={show}
          setShowModal={setShow}
          onConfirm={retoreBackup}
          isLoading={isLoading1}
          title="Restore Database"
          des="Restoring the database will replace the current data with the backup version. This action cannot be undone. Are you sure you want to proceed?"
        />
      )}
    </Drawer>
  );
};

export default DashboardSidebar;
