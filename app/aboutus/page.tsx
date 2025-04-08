import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center pt-20">
        <img
          src="https://cdn.shopify.com/s/files/1/0681/2821/1221/files/layout_ab_us_2_1.jpg?v=1721821378"
          alt="About Us"
          className="max-h-full max-w-full"
        />
      </main>
      <Footer />
    </div>
  )
}
