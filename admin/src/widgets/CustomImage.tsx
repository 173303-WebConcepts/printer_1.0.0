import Image from "next/image";

const CustomImage = ({
  src,
  className = "",
  priority = false,
  alt = "Image not found",
}: {
  src: string;
  className?: string;
  priority?: boolean;
  alt?: string;
}) => {
  return <Image priority={priority} src={src} alt={alt} fill={true} sizes="100%" className={`rounded-md object-cover object-center ${className}`} />;
};

export default CustomImage;
