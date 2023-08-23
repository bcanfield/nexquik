import Link from "next/link";
import { Roboto } from "next/font/google";
import Image from "next/image";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>Root Group Route Layout {children}</>;
}
