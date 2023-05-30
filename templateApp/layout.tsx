import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="root" lang="en">
      <body>
        <Link href={`/`} className="action-link">
          Return to Home
        </Link>
        {children}
      </body>
    </html>
  );
}
