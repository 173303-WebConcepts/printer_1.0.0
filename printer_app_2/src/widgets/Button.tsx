// import React from "react";
// import { TouchableOpacity, Text, TouchableOpacityProps } from "react-native";

// type PrimaryButtonProps = TouchableOpacityProps & {
//   title: string;
// };

// function PrimaryButton({ title, className = "", ...props }: PrimaryButtonProps) {
//   return (
//     <TouchableOpacity
//       {...props}
//       className={` py-3 px-6 rounded-lg items-center justify-center ${className} ${
//         props.disabled ? " bg-base-200 border border-base-content/15 opacity-50" : "bg-primary"
//       }`}
//     >
//       <Text className="text-white text-base font-semibold">{title}</Text>
//     </TouchableOpacity>
//   );
// }

// export { PrimaryButton }

import React from "react";
import { Button, ButtonText } from "@/components/ui/button";

type PrimaryButtonProps = React.ComponentProps<typeof Button> & {
  title: string;
};

export function PrimaryButton({ title, disabled, className, ...props }: PrimaryButtonProps) {
  const isDisabled = !!disabled; // ensures boolean

  return (
    <Button {...props} action="primary" isDisabled={isDisabled} className={`${className}`} size="lg" variant="solid">
      <ButtonText className="font-grotesk-semiBold">{title}</ButtonText>
    </Button>
  );
}
