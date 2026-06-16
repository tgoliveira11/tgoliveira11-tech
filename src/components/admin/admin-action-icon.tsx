import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArchiveIcon,
  BarChartIcon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  PencilIcon,
  TrashIcon,
  UploadIcon,
} from "@/components/admin/admin-icons";

export const adminActionIconClassName =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-subtle)] hover:text-[var(--foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50";

export type AdminActionIconName =
  | "edit"
  | "preview"
  | "publish"
  | "unpublish"
  | "duplicate"
  | "archive"
  | "delete"
  | "analytics"
  | "external"
  | "image";

const iconMap: Record<AdminActionIconName, () => ReactNode> = {
  edit: () => <PencilIcon />,
  preview: () => <EyeIcon />,
  publish: () => <UploadIcon />,
  unpublish: () => <EyeOffIcon />,
  duplicate: () => <CopyIcon />,
  archive: () => <ArchiveIcon />,
  delete: () => <TrashIcon />,
  analytics: () => <BarChartIcon />,
  external: () => <ExternalLinkIcon />,
  image: () => <ImageIcon />,
};

export function AdminActionIcon({
  name,
  className,
}: {
  name: AdminActionIconName;
  className?: string;
}) {
  const Icon = iconMap[name];
  return <span className={className}>{Icon()}</span>;
}

export function AdminActionIconLink({
  href,
  icon,
  label,
  title,
  className,
  target,
  rel,
}: {
  href: string;
  icon: AdminActionIconName;
  label: string;
  title?: string;
  className?: string;
  target?: string;
  rel?: string;
}) {
  return (
    <Link
      href={href}
      className={className ?? adminActionIconClassName}
      aria-label={label}
      title={title ?? label}
      target={target}
      rel={rel}
    >
      <AdminActionIcon name={icon} />
    </Link>
  );
}

export function AdminActionIconButton({
  icon,
  label,
  title,
  className,
  destructive,
  disabled,
  type = "button",
  onClick,
}: {
  icon: AdminActionIconName;
  label: string;
  title?: string;
  className?: string;
  destructive?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  const toneClass = destructive
    ? "text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
    : icon === "publish"
      ? "text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
      : icon === "unpublish"
        ? "text-orange-700 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
        : "";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${className ?? adminActionIconClassName} ${toneClass}`.trim()}
      aria-label={label}
      title={title ?? label}
      onClick={onClick}
    >
      <AdminActionIcon name={icon} />
    </button>
  );
}
