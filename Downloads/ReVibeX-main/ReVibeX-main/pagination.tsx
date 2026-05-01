import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const Search = (props: IconProps) => <Icon {...props}><path d="m21 21-4.3-4.3" /><circle cx="11" cy="11" r="8" /></Icon>;
export const SlidersHorizontal = (props: IconProps) => <Icon {...props}><path d="M10 5H3" /><path d="M12 19H3" /><path d="M14 3v4" /><path d="M16 17v4" /><path d="M21 12h-9" /><path d="M21 19h-5" /><path d="M21 5h-7" /><path d="M8 10v4" /><path d="M8 12H3" /></Icon>;
export const Bell = (props: IconProps) => <Icon {...props}><path d="M10.3 21a2 2 0 0 0 3.4 0" /><path d="M18 8A6 6 0 0 0 6 8c0 7-3 8-3 8h18s-3-1-3-8" /></Icon>;
export const X = (props: IconProps) => <Icon {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></Icon>;
export const Check = (props: IconProps) => <Icon {...props}><path d="M20 6 9 17l-5-5" /></Icon>;
export const ChevronLeft = (props: IconProps) => <Icon {...props}><path d="m15 18-6-6 6-6" /></Icon>;
export const ChevronRight = (props: IconProps) => <Icon {...props}><path d="m9 18 6-6-6-6" /></Icon>;
export const ChevronDown = (props: IconProps) => <Icon {...props}><path d="m6 9 6 6 6-6" /></Icon>;
export const Heart = (props: IconProps) => <Icon {...props}><path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 12 5a5.5 5.5 0 0 0-10 3.5c0 2.2 1.5 4 3 5.5l7 7Z" /></Icon>;
export const MapPin = (props: IconProps) => <Icon {...props}><path d="M20 10c0 4.9-8 12-8 12S4 14.9 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></Icon>;
export const Repeat = (props: IconProps) => <Icon {...props}><path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></Icon>;
export const Star = (props: IconProps) => <Icon {...props}><path d="M11.5 2.3a.6.6 0 0 1 1 0l2.6 5.3 5.8.9a.6.6 0 0 1 .3 1l-4.2 4.1 1 5.8a.6.6 0 0 1-.9.7L12 17.4l-5.2 2.7a.6.6 0 0 1-.9-.7l1-5.8-4.2-4.1a.6.6 0 0 1 .3-1l5.8-.9Z" /></Icon>;
export const MessageCircle = (props: IconProps) => <Icon {...props}><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></Icon>;
export const Tag = (props: IconProps) => <Icon {...props}><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.8 8.8a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8Z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></Icon>;
export const Flag = (props: IconProps) => <Icon {...props}><path d="M4 22V4a2 2 0 0 1 2-2h11l-1 5 1 5H6" /></Icon>;
export const Share2 = (props: IconProps) => <Icon {...props}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4" /><path d="m15.4 6.5-6.8 4" /></Icon>;
export const MoreVertical = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></Icon>;
export const MoreHorizontal = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="1" /><circle cx="5" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></Icon>;
export const ShoppingBag = (props: IconProps) => <Icon {...props}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></Icon>;
export const Users = (props: IconProps) => <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9" /><path d="M16 3.1a4 4 0 0 1 0 7.8" /></Icon>;
export const Eye = (props: IconProps) => <Icon {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7" /><circle cx="12" cy="12" r="3" /></Icon>;
export const EyeOff = (props: IconProps) => <Icon {...props}><path d="m2 2 20 20" /><path d="M6.7 6.7C3.8 8.7 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.5" /><path d="M10.6 5.1A9 9 0 0 1 12 5c6.5 0 10 7 10 7a13 13 0 0 1-3.2 4.2" /><path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" /></Icon>;
export const Loader2 = (props: IconProps) => <Icon {...props}><path d="M21 12a9 9 0 1 1-6.2-8.6" /></Icon>;
export const MailCheck = (props: IconProps) => <Icon {...props}><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" /><path d="m22 7-8.9 5.7a2 2 0 0 1-2.2 0L2 7" /><path d="m16 19 2 2 4-4" /></Icon>;
export const LifeBuoy = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><path d="m4.9 4.9 4.3 4.3" /><path d="m14.8 14.8 4.3 4.3" /><path d="m14.8 9.2 4.3-4.3" /><path d="m4.9 19.1 4.3-4.3" /></Icon>;
export const Settings = (props: IconProps) => <Icon {...props}><path d="M12.2 2h-.4a2 2 0 0 0-2 1.7l-.2 1.1a8 8 0 0 0-1.5.9L7 5.3a2 2 0 0 0-2.6.7l-.2.4a2 2 0 0 0 .2 2.7l.9.7a8 8 0 0 0 0 1.8l-.9.7a2 2 0 0 0-.2 2.7l.2.4A2 2 0 0 0 7 18.7l1.1-.4a8 8 0 0 0 1.5.9l.2 1.1a2 2 0 0 0 2 1.7h.4a2 2 0 0 0 2-1.7l.2-1.1a8 8 0 0 0 1.5-.9l1.1.4a2 2 0 0 0 2.6-.7l.2-.4a2 2 0 0 0-.2-2.7l-.9-.7a8 8 0 0 0 0-1.8l.9-.7a2 2 0 0 0 .2-2.7l-.2-.4A2 2 0 0 0 17 5.3l-1.1.4a8 8 0 0 0-1.5-.9l-.2-1.1a2 2 0 0 0-2-1.7Z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const Moon = (props: IconProps) => <Icon {...props}><path d="M20.9 13.5A8.5 8.5 0 1 1 10.5 3.1 6.5 6.5 0 0 0 20.9 13.5" /></Icon>;
export const LogOut = (props: IconProps) => <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></Icon>;
export const Shield = (props: IconProps) => <Icon {...props}><path d="M20 13c0 5-3.5 7.5-7.7 8.9a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.7a1.2 1.2 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1Z" /></Icon>;
export const FileText = (props: IconProps) => <Icon {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" /></Icon>;
export const Edit3 = (props: IconProps) => <Icon {...props}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>;
export const Package = (props: IconProps) => <Icon {...props}><path d="m7.5 4.3 9 5.2" /><path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></Icon>;
export const Trash2 = (props: IconProps) => <Icon {...props}><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="m19 6-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></Icon>;
export const Camera = (props: IconProps) => <Icon {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3Z" /><circle cx="12" cy="13" r="3" /></Icon>;
export const DollarSign = (props: IconProps) => <Icon {...props}><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></Icon>;
export const Send = (props: IconProps) => <Icon {...props}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></Icon>;
export const Sparkles = (props: IconProps) => <Icon {...props}><path d="M9.9 3.3 8.7 6.6 5.4 7.8l3.3 1.2 1.2 3.3 1.2-3.3 3.3-1.2-3.3-1.2Z" /><path d="M18 12.5 17.3 15l-2.5.7 2.5.7.7 2.5.7-2.5 2.5-.7-2.5-.7Z" /></Icon>;
export const Home = (props: IconProps) => <Icon {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" /></Icon>;
export const Plus = (props: IconProps) => <Icon {...props}><path d="M5 12h14" /><path d="M12 5v14" /></Icon>;
export const User = (props: IconProps) => <Icon {...props}><path d="M19 21a7 7 0 0 0-14 0" /><circle cx="12" cy="7" r="4" /></Icon>;