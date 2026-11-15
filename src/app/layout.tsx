import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxNote — Meeting intelligence",
  description: "Turn meeting conversations into clear decisions, owners and next steps."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}