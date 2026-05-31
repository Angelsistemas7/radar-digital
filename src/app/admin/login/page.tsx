import type { Metadata } from "next";
import Link from "next/link";
import { LogoLockup } from "@/components/ui/logo";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Acceso administrador",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
      <Link href="/" className="relative mb-8">
        <LogoLockup />
      </Link>
      <div className="relative">
        <AdminLoginForm next={next} />
      </div>
      <p className="relative mt-6 text-xs text-faint">
        Acceso restringido · Radar Digital
      </p>
    </main>
  );
}
