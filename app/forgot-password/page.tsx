import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center">Đặt lại mật khẩu</h2>
          <p className="text-gray-500 text-center mt-2">
            Chúng tôi sẽ gửi email cho bạn để đặt lại mật khẩu
          </p>

          <div className="mt-6">
            <label htmlFor="email" className="block text-gray-600">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 w-full px-4 py-2 border rounded-md focus:ring focus:ring-gray-300"
              placeholder="Nhập email của bạn"
            />
          </div>

          <button
            className="mt-6 w-full bg-black text-white py-2 rounded-md hover:opacity-90"
          >
            Gửi
          </button>

          <div className="text-center mt-4">
            <a href="#" className="text-sm text-gray-600 hover:underline">
              Quên Email?
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
