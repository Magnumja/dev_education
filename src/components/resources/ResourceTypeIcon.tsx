import {
  BookOpen,
  Code2,
  Dumbbell,
  FileText,
  FolderGit2,
  GraduationCap,
  PlayCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ResourceType } from "@/types";

const ICONS: Record<ResourceType, React.ElementType> = {
  video: PlayCircle,
  documentation: BookOpen,
  article: FileText,
  pdf: FileText,
  exercise: Dumbbell,
  repository: FolderGit2,
  course: GraduationCap,
  tool: Wrench,
};

/** Tons discretos dentro da paleta da marca — nunca cores decorativas. */
const TONES: Record<ResourceType, string> = {
  video: "text-brand-500",
  documentation: "text-navy-800",
  article: "text-ink-500",
  pdf: "text-ink-500",
  exercise: "text-brand-400",
  repository: "text-navy-900",
  course: "text-brand-600",
  tool: "text-ink-700",
};

interface ResourceTypeIconProps {
  type: ResourceType;
  className?: string;
}

export function ResourceTypeIcon({ type, className }: ResourceTypeIconProps) {
  const Icon = ICONS[type] ?? Code2;
  return <Icon className={cn("size-4", TONES[type], className)} aria-hidden />;
}
