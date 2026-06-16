import Image from "next/image";
import { ABOUT_PROFILE_IMAGE } from "@/modules/public/about-content";

export function AboutProfileImage({
  className = "",
  priority = false,
  sizes = "(max-width: 640px) 192px, (max-width: 1024px) 240px, 280px",
}: {
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={ABOUT_PROFILE_IMAGE.src}
      alt={ABOUT_PROFILE_IMAGE.alt}
      width={ABOUT_PROFILE_IMAGE.width}
      height={ABOUT_PROFILE_IMAGE.height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
