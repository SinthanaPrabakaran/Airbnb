"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Home,
  Plus,
  Calendar,
  Layers,
  ChevronDown,
  Check,
  User as UserIcon,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { getCurrentHostId, setCurrentHostId, DEFAULT_CURRENT_HOST } from "@/lib/current-user";
import { useToast } from "@/components/ui/toast";

interface HostHeaderProps {
  currentHost?: User | null;
  onSelectHost?: (host: User) => void;
}

export function HostHeader({ currentHost: propHost, onSelectHost }: HostHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  const [hosts, setHosts] = useState<User[]>([]);
  const [activeHost, setActiveHost] = useState<User>(propHost || DEFAULT_CURRENT_HOST);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    api.users.getAll().then((users) => {
      if (!isMounted) return;
      const hostUsers = users.filter((u) => u.role === "host");
      setHosts(hostUsers.length > 0 ? hostUsers : users);

      const savedHostId = getCurrentHostId();
      const current = hostUsers.find((h) => h.id === savedHostId) || hostUsers[0] || DEFAULT_CURRENT_HOST;
      setActiveHost(current);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (propHost) {
      setActiveHost(propHost);
    }
  }, [propHost]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchHost = (host: User) => {
    setActiveHost(host);
    setCurrentHostId(host.id);
    setIsMenuOpen(false);
    if (onSelectHost) {
      onSelectHost(host);
    }
    showToast(`Switched active host to ${host.name}`, "info");
    router.refresh();
  };

  const navLinks = [
    { label: "Overview", href: "/host", icon: Home },
    { label: "Listings", href: "/host/listings", icon: Layers },
    { label: "Reservations", href: "/host/bookings", icon: Calendar },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          {/* Logo & Host Mode Badge */}
          <div className="flex items-center gap-3">
            <Link href="/host" className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-[#FF385C]">Staybnb</span>
            </Link>
            <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
              Host
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 rounded-2xl bg-neutral-100/80 p-1">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                tab.href === "/host"
                  ? pathname === "/host"
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    isActive
                      ? "bg-white text-neutral-900 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Host Switcher */}
          <div className="flex items-center gap-3">
            <Link
              href="/host/listings/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E00B41] to-[#FF385C] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:brightness-105 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Create Listing</span>
              <span className="sm:hidden">New</span>
            </Link>

            <Link
              href="/"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition px-2 py-1.5 rounded-lg hover:bg-neutral-100"
            >
              <Compass className="h-3.5 w-3.5 text-neutral-400" />
              <span>Switch to Traveling</span>
            </Link>

            {/* Host Profile Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 rounded-full border border-neutral-300 bg-white p-1 pl-2.5 transition hover:shadow-md"
              >
                <div className="flex items-center gap-1.5">
                  <div className="relative h-6 w-6 overflow-hidden rounded-full bg-neutral-200">
                    {activeHost.avatar ? (
                      <img
                        src={activeHost.avatar}
                        alt={activeHost.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-3.5 w-3.5 text-neutral-500 m-auto" />
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-neutral-900 truncate max-w-[100px]">
                    {activeHost.name.split(" ")[0]}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400 pr-1" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-neutral-200 bg-white p-2 shadow-2xl animate-in fade-in zoom-in-95 duration-100 z-50">
                  <div className="p-2 border-b border-neutral-100">
                    <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Current Host Mode
                    </p>
                    <p className="text-xs font-bold text-neutral-900 mt-0.5">{activeHost.name}</p>
                    <p className="text-[11px] text-neutral-500 truncate">{activeHost.email}</p>
                  </div>

                  <div className="py-2 border-b border-neutral-100">
                    <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Switch Host Profile
                    </p>
                    {hosts.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleSwitchHost(h)}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs text-left transition ${
                          activeHost.id === h.id
                            ? "bg-neutral-100 font-bold text-neutral-900"
                            : "text-neutral-700 hover:bg-neutral-50"
                        }`}
                      >
                        <span className="truncate">{h.name}</span>
                        {activeHost.id === h.id && <Check className="h-3.5 w-3.5 text-[#FF385C]" />}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      <Compass className="h-4 w-4 text-neutral-500" />
                      <span>Back to Guest Explore</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Subnavigation */}
        <div className="flex md:hidden items-center justify-around border-t border-neutral-100 py-2">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/host"
                ? pathname === "/host"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 text-[11px] font-bold ${
                  isActive ? "text-[#FF385C]" : "text-neutral-500"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
