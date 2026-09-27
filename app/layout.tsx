import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "ชาวพนม Flood Watch",
  description: "ศูนย์ข้อมูลน้ำและแจ้งเหตุน้ำท่วมเพื่อพี่น้องชาวพนมสารคาม",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-slate-900 text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}