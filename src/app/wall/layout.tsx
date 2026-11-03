import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ApexDesk Wall — Live Operations",
  description: "Full-screen live ticket board for operations monitors",
};

export default function WallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0e14] text-slate-100 antialiased overflow-hidden">
      {children}
    </div>
  );
}
