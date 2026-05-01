/**
 * Type shim for lucide-react.
 * v0.460 ships without .d.ts files in some installs. This restores enough
 * typing to use named icon imports as React components.
 */
declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    strokeWidth?: number | string;
  }

  export type LucideIcon = ComponentType<LucideProps>;

  // Allow any named import to resolve as a LucideIcon component.
  // (Real runtime exports come from lucide-react itself.)
  const icon: LucideIcon;
  export default icon;

  // Catch-all named export — lets `import { Foo } from "lucide-react"` type-check
  // for any icon name without us listing all 1000+ icons.
  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const Award: LucideIcon;
  export const Bell: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Building: LucideIcon;
  export const Calendar: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Circle: LucideIcon;
  export const Clock: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FileText: LucideIcon;
  export const Filter: LucideIcon;
  export const Github: LucideIcon;
  export const Globe: LucideIcon;
  export const Home: LucideIcon;
  export const Info: LucideIcon;
  export const InfoIcon: LucideIcon;
  export const Loader2: LucideIcon;
  export const ListFilter: LucideIcon;
  export const Lock: LucideIcon;
  export const LogIn: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Menu: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const Monitor: LucideIcon;
  export const Moon: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Plus: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Search: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Settings: LucideIcon;
  export const Shield: LucideIcon;
  export const Star: LucideIcon;
  export const Sun: LucideIcon;
  export const ThumbsUp: LucideIcon;
  export const Trash: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const User: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
  export const Zap: LucideIcon;
}
