import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ชาวพนม Flood Watch",
  description: "ศูนย์ติดตามสถานการณ์น้ำและแจ้งเหตุน้ำท่วม อ.พนมสารคาม จ.ฉะเชิงเทรา",
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