import { cssInterop } from "nativewind";
import React from "react";
import type { ComponentType } from "react";
import Ionicons from '@react-native-vector-icons/ionicons';


// Reusable Icon Props
interface AppIconProps {
  name: string;
  size?: number;
  className?: string;
  IconComponent?: ComponentType<any>; // Ionicons, MaterialIcons, etc.
}

// Tell NativeWind how to style
function withInterop(IconComponent: ComponentType<any> = Ionicons) {
  cssInterop(IconComponent, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
      },
    },
  });
  return IconComponent;
}

const AppIcon: React.FC<AppIconProps> = ({ name, size = 24, className, IconComponent = Ionicons}) => {
  const Icon = withInterop(IconComponent);
  return <Icon name={name} size={size} className={`text-base-content-70 ${className}`} />;
};

export default AppIcon;
