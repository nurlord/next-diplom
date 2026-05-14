/**
 * ╔═══════════════════════════════════════════════════════╗
 * ║           JAZYLYM DESIGN SYSTEM — UI COMPONENTS       ║
 * ║                                                       ║
 * ║  Reusable, composable components for the entire app.  ║
 * ║  ALWAYS use these instead of inline styles.           ║
 * ║                                                       ║
 * ║  Components:                                          ║
 * ║    • Button       — All button variants                ║
 * ║    • Badge        — Status & label badges              ║
 * ║    • Card         — Section containers                 ║
 * ║    • SectionHeader — Section titles with icons         ║
 * ║    • StatCard     — Metric display cards               ║
 * ║    • Modal        — Dialog overlay                     ║
 * ║    • FormField    — Input/textarea with label          ║
 * ║    • Skeleton     — Animated loading placeholder       ║
 * ╚═══════════════════════════════════════════════════════╝
 */

import React, { ReactNode } from "react";
import { LucideIcon, X, Loader2 } from "lucide-react";

// ────────────────────────────────────────────────────────
//  BUTTON
// ────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20",
  secondary:
    "bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700",
  danger:
    "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20",
  ghost:
    "bg-transparent hover:bg-white/5 text-neutral-400 hover:text-white",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-sm rounded-2xl gap-2",
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading = false,
  fullWidth = false,
  children,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        font-bold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none
        flex items-center justify-center
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === "sm" ? 14 : 16} />
      ) : null}
      {children}
    </button>
  );
}

// ────────────────────────────────────────────────────────
//  BADGE
// ────────────────────────────────────────────────────────

type BadgeVariant =
  | "blue"
  | "green"
  | "red"
  | "orange"
  | "yellow"
  | "purple"
  | "neutral";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: LucideIcon;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/10",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  purple: "bg-purple-500/20 text-purple-400 border-purple-500/20",
  neutral: "bg-neutral-800 text-neutral-400 border-neutral-700",
};

export function Badge({
  children,
  variant = "blue",
  icon: Icon,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full border
        text-[10px] font-black uppercase tracking-wider
        ${badgeVariants[variant]}
        ${className}
      `.trim()}
    >
      {Icon && <Icon size={10} />}
      {children}
    </span>
  );
}

// ────────────────────────────────────────────────────────
//  CARD
// ────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  /** Adds a subtle glow color on the card */
  glow?: "blue" | "purple" | "green" | "orange" | "none";
  /** Interactive — shows hover effects */
  interactive?: boolean;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

const cardPadding: Record<string, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

const glowStyles: Record<string, string> = {
  blue: "hover:border-blue-500/30",
  purple: "hover:border-purple-500/30",
  green: "hover:border-emerald-500/30",
  orange: "hover:border-orange-500/30",
  none: "",
};

export function Card({
  children,
  glow = "none",
  interactive = false,
  className = "",
  padding = "md",
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-neutral-900 border border-neutral-800 rounded-[2rem] shadow-lg
        relative overflow-hidden transition-all
        ${cardPadding[padding]}
        ${interactive ? "cursor-pointer active:scale-[0.98] hover:bg-neutral-800/80" : ""}
        ${glowStyles[glow]}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  SECTION HEADER
// ────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  /** Right-side element (e.g. a button or badge) */
  action?: ReactNode;
  subtitle?: string;
}

export function SectionHeader({
  title,
  icon: Icon,
  iconColor = "text-blue-500",
  action,
  subtitle,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1">
      <div>
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
          {Icon && <Icon size={16} className={iconColor} />}
          {title}
        </h3>
        {subtitle && (
          <p className="text-[10px] text-neutral-500 font-medium mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  STAT CARD
// ────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  /** e.g. "+3" or "-2", shown with color coding */
  change?: number;
  suffix?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  suffix,
  className = "",
}: StatCardProps) {
  return (
    <Card className={className}>
      {Icon && (
        <Icon
          className="absolute -right-2 -bottom-2 text-blue-500/10"
          size={60}
        />
      )}
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-black text-white">{value}</p>
        {suffix && (
          <span className="text-xs text-neutral-500 font-bold">{suffix}</span>
        )}
        {change !== undefined && (
          <span
            className={`flex items-center text-[10px] font-black ${
              change >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {change >= 0 ? "↑" : "↓"}
            {Math.abs(change)}
          </span>
        )}
      </div>
    </Card>
  );
}

// ────────────────────────────────────────────────────────
//  MODAL
// ────────────────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  /** Whether content may overflow (e.g. forms) */
  scrollable?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  scrollable = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-start justify-center p-4
        bg-black/80 backdrop-blur-md animate-in fade-in duration-300
        ${scrollable ? "overflow-y-auto pt-12 pb-24" : "items-center"}
      `}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-6 w-full max-w-sm shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <h3 className="text-lg font-black mb-5 flex items-center gap-2">
          {Icon && <Icon size={20} className="text-blue-400" />}
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  FORM FIELD
// ────────────────────────────────────────────────────────

interface FormFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ label, children, className = "" }: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Standardized text input */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`
        w-full bg-neutral-800 border border-neutral-700 rounded-2xl
        px-4 py-3 text-sm
        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        transition-all placeholder:text-neutral-600
        ${className}
      `.trim()}
      {...props}
    />
  );
}

/** Standardized textarea */
interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      className={`
        w-full bg-neutral-800 border border-neutral-700 rounded-2xl
        px-4 py-3 text-sm min-h-[100px]
        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        transition-all placeholder:text-neutral-600
        ${className}
      `.trim()}
      {...props}
    />
  );
}

/** Standardized select */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      className={`
        w-full bg-neutral-800 border border-neutral-700 rounded-2xl
        px-4 py-3 text-sm
        focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
        transition-all
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </select>
  );
}

// ────────────────────────────────────────────────────────
//  SKELETON
// ────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

/** A single animated skeleton bar */
export function Skeleton({ className = "h-6 w-full" }: SkeletonProps) {
  return (
    <div className={`bg-neutral-800/60 rounded-xl animate-pulse ${className}`} />
  );
}

/** Pre-composed skeleton for a card */
export function CardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-neutral-900 border border-neutral-800 rounded-[2rem] p-5 space-y-3"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neutral-800" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-neutral-800 rounded-lg" />
              <div className="h-3 w-1/2 bg-neutral-800/60 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  PAGE WRAPPER
// ────────────────────────────────────────────────────────

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

/** Standard page container with padding, bottom nav space, entrance animation */
export function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <div
      className={`
        pb-24 pt-6 px-5 space-y-6 min-h-screen
        animate-in fade-in slide-in-from-bottom-4 duration-500
        text-white
        ${className}
      `.trim()}
    >
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────
//  PAGE HEADER
// ────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm text-neutral-500 font-medium mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
