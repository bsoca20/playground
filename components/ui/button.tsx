import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "md" | "lg";
  className?: string;
};

const styles = {
  default: "bg-brand-red text-white hover:bg-red-700",
  outline: "border border-zinc-300 bg-white text-zinc-950 hover:bg-zinc-100",
  ghost: "bg-transparent text-white hover:bg-white/10"
};

const sizes = {
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base"
};

export function Button({
  children,
  href,
  variant = "default",
  size = "md",
  className,
  ...props
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-xl font-semibold transition-colors",
    styles[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href as never} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
