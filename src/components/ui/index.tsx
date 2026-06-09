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
    "bg-gray-900 hover:bg-black text-white shadow-md shadow-gray-900/10",
  secondary:
    "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-sm",
  danger:
    "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100",
  ghost:
    "bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-900",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-lg gap-2",
  lg: "px-5 py-3 text-sm rounded-lg gap-2",
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
  blue: "bg-blue-50 text-blue-600 border-transparent",
  green: "bg-green-50 text-green-600 border-transparent",
  red: "bg-red-50 text-red-600 border-transparent",
  orange: "bg-orange-50 text-orange-600 border-transparent",
  yellow: "bg-yellow-50 text-yellow-600 border-transparent",
  purple: "bg-purple-50 text-purple-600 border-transparent",
  neutral: "bg-gray-100 text-gray-600 border-transparent",
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
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
      className={`
        border rounded-xl
        relative overflow-hidden transition-all
        ${cardPadding[padding]}
        ${glowStyles[glow]}
        ${interactive ? "cursor-pointer active:scale-[0.98]" : ""}
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
        <h3 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
          {Icon && <Icon size={16} className={iconColor} />}
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>
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
          className="absolute -right-2 -bottom-2 text-gray-100"
          size={60}
        />
      )}
      <p className="text-[11px] font-semibold text-gray-500 mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-black text-gray-900">{value}</p>
        {suffix && (
          <span className="text-xs text-gray-500 font-bold">{suffix}</span>
        )}
        {change !== undefined && (
          <span
            className={`flex items-center text-[10px] font-black ${
              change >= 0 ? "text-green-600" : "text-red-600"
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
        fixed inset-0 z-50 flex p-4
        backdrop-blur-sm animate-in fade-in duration-200
        ${scrollable ? "items-start overflow-y-auto pt-12 pb-24" : "items-center justify-center"}
      `}
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="rounded-xl p-5 w-full max-w-sm relative mx-auto"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "var(--shadow-modal)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)")}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")}
        >
          <X size={18} />
        </button>
        <h3
          className="text-base font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          {Icon && <Icon size={17} style={{ color: "var(--text-secondary)" }} />}
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
    <div className={`space-y-1.5 ${className}`}>
      <label
        className="text-xs font-medium block px-0.5"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

/** Standardized text input */
type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", style, ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none transition-colors ${className}`.trim()}
      style={{
        background: "var(--bg-subtle)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
        ...style,
      }}
      {...props}
    />
  );
}

/** Standardized textarea */
type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea({ className = "", style, ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full rounded-lg px-3 py-2.5 text-sm border min-h-[100px] focus:outline-none transition-colors resize-none ${className}`.trim()}
      style={{
        background: "var(--bg-subtle)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
        ...style,
      }}
      {...props}
    />
  );
}

/** Standardized select */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function Select({ className = "", children, style, ...props }: SelectProps) {
  return (
    <select
      className={`w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none transition-colors ${className}`.trim()}
      style={{
        background: "var(--bg-subtle)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
        ...style,
      }}
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
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: "var(--bg-muted)" }}
    />
  );
}

/** Pre-composed skeleton for a card */
export function CardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-4 border space-y-3"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg" style={{ background: "var(--bg-muted)" }} />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded-lg" style={{ background: "var(--bg-muted)" }} />
              <div className="h-2.5 w-1/2 rounded-lg" style={{ background: "var(--bg-muted)" }} />
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
        text-gray-900
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
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
