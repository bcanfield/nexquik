import { Roboto } from "next/font/google";

// const roboto = Roboto({
//   weight: "400",
//   subsets: ["latin"],
//   display: "swap",
// });
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
