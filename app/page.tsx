import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import Banner from "@/components/Banner/Banner";
import BestSeller from "@/components/BestSeller/BestSeller";
import Styling from "@/components/Styling/Styling";
import PromotionCode from "@/components/PromotionCode/PromotionCode";
import Advertise from "@/components/Advertise/Advertise";
import Chatbot from "@/components/ChatBot/ChatBot";
import { ChatBotProvider } from "@/contexts/ChatBotContextProps";
import Suggest from "@/components/Suggest/Suggest";
export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pt-20">
        <Banner />
        <BestSeller />
        <Suggest />
        <PromotionCode />
        <Advertise />
        <ChatBotProvider>
          <Chatbot />
        </ChatBotProvider>

      </main>
      <Footer />

      {/* Thêm Chatbot ở cuối file */}
    </div>
  );
}
