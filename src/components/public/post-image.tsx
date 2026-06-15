import Image from "next/image";

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

  return (
    <Image
      src={src}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      className={className}
      priority={priority}
      unoptimized={!width || !height}
    />
  );
}
