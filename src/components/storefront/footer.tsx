import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} GameStore. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/track" className="hover:text-foreground">
            Track shipment
          </Link>
          <Link href="/support" className="hover:text-foreground">
            Contact support
          </Link>
          <p>Janinduthedev</p>
        </div>
      </div>
    </footer>
  );
}
