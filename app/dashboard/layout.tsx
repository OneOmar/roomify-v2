import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-black/[.08] dark:border-white/[.145] px-6 py-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="font-semibold text-sm hover:underline underline-offset-4"
        >
          Dashboard
        </Link>
        <UserButton />
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
