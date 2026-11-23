import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Sedes, Cabins, Entorno, Pets, Location, Footer } from "@/components/Sections";
import { Availability } from "@/components/Availability";
import { BookingSection } from "@/components/BookingSection";
import { ChatWidget } from "@/chat/ChatWidget";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Sedes />
        <Cabins />
        <Availability />
        <BookingSection />
        <Entorno />
        <Pets />
        <Location />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
