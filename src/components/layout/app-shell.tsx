"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Plus,
  ReceiptText,
  Scale,
} from "lucide-react";
import { ExpenseDialog } from "@/components/expenses/expense-dialog";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: ReceiptText },
  { href: "/reconciliation", label: "Reconcile", icon: Scale },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card/82 px-4 py-5 backdrop-blur-xl md:flex md:flex-col">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ClipboardList className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Warehouse</span>
            <span className="block text-xs text-muted-foreground">Expense Tracker</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                  isActive && "bg-secondary text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <ExpenseDialog
            trigger={
              <Button className="w-full justify-start gap-2">
                <Plus className="size-4" />
                Quick Add Expense
              </Button>
            }
          />
          <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b bg-card/84 backdrop-blur-xl md:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList className="size-4" />
            </span>
            Warehouse
          </Link>
          <div className="flex items-center gap-2">
            <ExpenseDialog
              trigger={
                <Button size="icon" title="Quick add expense">
                  <Plus className="size-4" />
                  <span className="sr-only">Quick add expense</span>
                </Button>
              }
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="pb-24 md:pl-64 md:pb-0">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-8 lg:px-8">
          {children}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t bg-card/94 px-2 py-2 backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted-foreground",
                isActive && "bg-secondary text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
