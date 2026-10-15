import { AppProvider } from "@/context/AppContext";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppProvider>{children}</AppProvider>;
}
