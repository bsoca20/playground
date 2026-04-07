"use client";

import type { ReactNode } from "react";
import { Action } from "@/lib/types";

export function ActionCard({
  action,
  index,
  children
}: {
  action: Action;
  index?: number;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-red">
          {action.category}
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {action.kind.replaceAll("_", " ")}
        </span>
      </div>
      <div className="mt-4 font-black text-zinc-950">
        {index ? `${index}. ` : ""}
        {action.title}
      </div>
      <p className="mt-1 text-sm leading-6 text-zinc-600">{action.description}</p>
      {children ? <div className="mt-3 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
