"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: "default" | "rose" | "emerald" | "amber" | "blue";
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "default",
}: StatsCardProps) {
  const colorStyles = {
    default: "bg-neutral-50 text-neutral-800",
    rose: "bg-rose-50 text-[#FF385C]",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
  };

  return (
    <div className="rounded-3xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${colorStyles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-neutral-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div className="mt-3 border-t border-neutral-100 pt-3 text-[11px] font-semibold text-emerald-600">
          {trend}
        </div>
      )}
    </div>
  );
}
