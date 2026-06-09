import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-5xl font-bold text-foreground">404</h1>
        <p className="text-sm text-muted-foreground">找不到這個頁面。</p>
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          回首頁
        </Link>
      </div>
    </div>
  );
}
