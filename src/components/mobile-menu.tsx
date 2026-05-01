"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/jobs", label: "Browse jobs" },
  { href: "/underwriters", label: "Underwriters" },
  { href: "/about", label: "About" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-md text-[var(--color-fg)] hover:bg-[var(--color-border)]/40"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 top-16 z-50 bg-[var(--color-card)] border-t overflow-y-auto">
          <nav className="container-page py-6 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center rounded-md px-4 py-3 text-base font-medium text-[var(--color-fg)] hover:bg-[var(--color-border)]/40 active:bg-[var(--color-border)]/60"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-4 border-t pt-4 flex flex-col gap-2">
              <Link href="/login" className="w-full">
                <Button variant="secondary" className="w-full" size="lg">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" className="w-full">
                <Button variant="primary" className="w-full" size="lg">
                  Join the network
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
