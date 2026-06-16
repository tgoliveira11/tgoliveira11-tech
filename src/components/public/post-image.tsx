import Image from "next/image";
import { isRemoteAssetUrl } from "@/modules/assets/assets.utils";

export function PostImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
}: {
  src: string;
  alt: string;
  width?: number | null;
  height?: number | null;
  className?: string;
  priority?: boolean;
}) {
  const resolvedWidth = width && width > 0 ? width : 1200;
  const resolvedHeight = height && height > 0 ? height : 630;
  const remote = isRemoteAssetUrl(src);
  const unoptimized = remote || !width || !height;

  return (
    <Image
      src={src}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      className={className}
      priority={priority}
      unoptimized={unoptimized}
    />
  );
}
