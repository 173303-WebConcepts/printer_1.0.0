import { Avatar, AvatarBadge, AvatarFallbackText, AvatarImage } from "@/components/ui/avatar";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Constant } from "@/src/utils/Constant";
import { ThemedText } from "@/src/widgets/ThemeText";
import { Pressable, Text } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ImageUploader from "../ImageUploader";
import { useEffect, useState } from "react";
import { currentRouteName, navigationRef } from "@/App";
import RealmImage from "@/src/widgets/RealmImage";
import { getLocalProfile } from "@/src/database/services/profile.service";
import { useRealm } from "@realm/react";
import AppIcon from "../AppIcon";
import { setItemDetails } from "@/src/redux/slices/commonSlice";
import { View } from "react-native";
import { getRealmSize } from "@/src/database/realmInstance";

const ProfileD = ({ setShowDrawer }: any) => {
  const [imageValue, setImageValue] = useState(null);
  const [databaseSize, setDatabaseSize] = useState<any>(null);

  const [profile, setProfile] = useState<any>(null);

  const { user } = useSelector((state: any) => state.user);

  const dispatch = useDispatch();

  // const realm = useRealm();



  // 🔥 Load from Realm (offline)
  const loadLocal = async () => {
    const profileData = await getLocalProfile();

    if (profileData) {
      setProfile(profileData);
    }
  };

  useEffect(() => {
    const loadSize = async () => {
      const size = await getRealmSize();
      setDatabaseSize(size);

    };

    loadLocal();
    loadSize();
  }, []);

  const handleProfileClick = () => {

    if (profile?.avatar) {
      dispatch(setItemDetails({ image: profile?.avatar }));
    }
    setShowDrawer(false);
    navigationRef.navigate("Profile");
  };

  return (
    <View className="border-b border-b-base-content-10">
      <Pressable onPress={handleProfileClick} className="flex-row justify-between items-center">
        <VStack space="2xl">
          <HStack space="md" className=" pb-3 pl-1 pt-1">
            <Avatar className="bg-primary" size="lg">
              {profile?.avatar ? (
                <RealmImage binary={profile.avatar.binary} mimeType={profile.avatar.mimeType} className="rounded-full w-[60px] h-[60px]" />
              ) : (
                <AvatarFallbackText>
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallbackText>
              )}
            </Avatar>
            <VStack>
              <ThemedText className="capitalize font-grotes-bold text-xl">{user?.name}</ThemedText>
              <ThemedText className="">0{user?.phone}</ThemedText>
            </VStack>
          </HStack>
        </VStack>
        <AppIcon name="chevron-forward-outline" />
      </Pressable>
      <View className="flex-row justify-between pb-2 border-t py-2 border-t-base-content-10">
        <ThemedText className=" ">Database Size: {databaseSize || 0} MB</ThemedText>
      </View>
    </View>
  );
};

export default ProfileD;
