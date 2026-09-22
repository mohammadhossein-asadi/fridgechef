import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" className="mx-auto min-h-[80vh] max-w-6xl px-4 pb-16 pt-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
