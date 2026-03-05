import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/lib/demo-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyHealthRecord — Your Health Data, Your Control",
  description:
    "Patient-controlled health data platform. See all your records, understand your health with AI, and share on your terms.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DemoProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
