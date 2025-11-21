import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bakeoff 3",
  description: "COSC559: Human Computer Interaction Bakeoff 3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body
        className="w-full h-full flex flex-col justify-center items-center"
      >
        {children}
      </body>
    </html>
  );
}
