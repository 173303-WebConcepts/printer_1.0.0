import React, { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { Skeleton } from "@/components/ui/skeleton";
import { Helper } from "../utils/Helper";

export default function RealmImage({ binary, mimeType = "image/jpeg", className }: any) {
  const [base64, setBase64] = useState<string | null>(null);

  // Render skeleton FIRST — never block render
  useEffect(() => {
    if (!binary) return;
    let isMounted = true;

    // decode AFTER initial render
    setTimeout(() => {
      Helper.binaryToBase64(binary)
        .then(res => {
          if (isMounted) setBase64(res);
        })
        .catch(() => {
          if (isMounted) setBase64(null);
        });
    }, 0); // 0ms = let render finish first

    return () => {
      isMounted = false;
    };
  }, [binary]);

  // Show skeleton while decoding
  if (!base64) return <Skeleton className={className} speed={3} />;

  return <Image source={{ uri: `data:${mimeType};base64,${base64}` }} className={className} />;
}
