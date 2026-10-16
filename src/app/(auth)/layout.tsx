import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-2xl font-bold">
        Game<span className="text-primary">Store</span>
      </Link>
      <div className="w-full max-w-md rounded-lg border bg-card p-8">
        {children}
      </div>
    </div>
  );
}
