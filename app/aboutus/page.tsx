import Header from "@/components/Header/Header"
import Footer from "@/components/Footer/Footer"

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center pt-20">
        <img
          src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1746376663/image_3_eevan2.png"
          alt="About Us"
          className="max-h-full max-w-full"
        />
      </main>
      <Footer />
    </div>
  )
}
