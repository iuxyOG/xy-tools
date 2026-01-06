import type { ReactNode } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Topbar } from "../../components/Topbar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <main className="container">{children}</main>
      </div>
    </div>
  );
}
