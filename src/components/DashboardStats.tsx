import React from "react";
import { Users, CheckCircle2, Clock, Ban, ArrowUpRight } from "lucide-react";
import { DashboardStats as StatsType } from "../types";

interface DashboardStatsProps {
  stats: StatsType | null;
  loading: boolean;
  filter: "all" | "active" | "expired" | "banned";
  setFilter: (f: "all" | "active" | "expired" | "banned") => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  loading,
  filter,
  setFilter,
}) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  const cards = [
    {
      key: "all",
      label: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "amber",
      bgClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      activeBorder: "border-amber-500 ring-1 ring-amber-500/50",
    },
    {
      key: "active",
      label: "Active Users",
      value: stats.active_users,
      icon: CheckCircle2,
      color: "emerald",
      bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      activeBorder: "border-emerald-500 ring-1 ring-emerald-500/50",
    },
    {
      key: "expired",
      label: "Expired Subscriptions",
      value: stats.expired_users,
      icon: Clock,
      color: "orange",
      bgClass: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      activeBorder: "border-orange-500 ring-1 ring-orange-500/50",
    },
    {
      key: "banned",
      label: "Banned / Disabled",
      value: stats.banned_users,
      icon: Ban,
      color: "red",
      bgClass: "bg-red-500/10 text-red-400 border-red-500/20",
      activeBorder: "border-red-500 ring-1 ring-red-500/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = filter === card.key;

        return (
          <div
            key={card.key}
            onClick={() => setFilter(card.key as any)}
            className={`bg-slate-900 border ${
              isSelected ? card.activeBorder : "border-slate-800 hover:border-slate-700"
            } rounded-2xl p-5 cursor-pointer transition shadow-lg shadow-slate-950/40 relative overflow-hidden group`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-slate-100">{card.value}</p>
              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.bgClass}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
              <span>Filter list</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
