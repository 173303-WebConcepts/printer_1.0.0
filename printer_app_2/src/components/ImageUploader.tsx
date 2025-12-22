import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { ThemedText } from "../widgets/ThemeText";
import AppIcon from "./AppIcon";
import { Helper } from "../utils/Helper";
import ImageCropPicker from "react-native-image-crop-picker";

export default function ImageUploader({ setFieldValue, value }: any) {
  const [preview, setPreview] = useState<string | null>(null);

  // When editing product: value = Realm Image object
  useEffect(() => {
    const loadImage = async () => {
      if (!value) return;

      // CASE 1: New image selected
      if (value.uri) {
        setPreview(value.uri);
        return;
      }

      // CASE 2: Realm image object
      if (value.binary) {
        const base64 = await Helper.binaryToBase64(value.binary);
        setPreview(`data:${value.mimeType};base64,${base64}`);
      }
    };

    loadImage();
  }, [value]);


  const pickAndCrop = async () => {
    const image = await ImageCropPicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
      cropperCircleOverlay: true, // for round crop
    });

    setPreview(image.path);
    setFieldValue("image", {
      uri: image.path,
      fileName: image.filename,
      type: image.mime,
    });
  };

  return (
    <View className="items-center">
      <TouchableOpacity
        onPress={pickAndCrop}
        className="w-28 h-28 rounded-full border border-base-content-70 bg items-center justify-center overflow-hidden"
      >
        {preview ? (
          <Image source={{ uri: preview }} className="w-28 h-28 rounded-full" />
        ) : (
          <>
            <AppIcon IconComponent={Ionicons} name="images-outline" size={30} className="text-base-content-70" />
            <ThemedText className="text-xs !text-base-content-2 mt-1">1:1 Ratio</ThemedText>
            <ThemedText className="text-xs !text-base-content-2">112 px x 112px</ThemedText>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
