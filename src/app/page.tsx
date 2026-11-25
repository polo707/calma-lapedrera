import { Availability } from "@/components/Availability";
import { Pets, Location, Footer } from "@/components/Sections";
import { ChatWidget } from "@/chat/ChatWidget";
import { Loader } from "@/cine/Loader";
import { Stage } from "@/cine/Stage";
import { SiteHeader } from "@/cine/SiteHeader";
import { Chapters } from "@/cine/Chapters";
import { Chronicle } from "@/cine/Chronicle";
import { Passage } from "@/cine/Passage";
import { BookingPanel } from "@/cine/BookingPanel";

export default function Home() {
  return (
    <>
      <Loader />
      <Stage />
      <SiteHeader />
      <main className="cine-main">
        <Chapters />
        <Chronicle />
        <Passage />
        <div className="paper">
          <div data-chapter="7" data-tone="light"><Availability /></div>
          <div data-chapter="8" data-tone="light"><Pets /></div>
          <div data-chapter="9" data-tone="light"><Location /></div>
        </div>
      </main>
      <div data-tone="light" className="paper paper--footer"><Footer /></div>
      <BookingPanel />
      <ChatWidget />
    </>
  );
}
