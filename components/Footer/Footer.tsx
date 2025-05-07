"use client";
import Link from 'next/link';
export default function Footer() {
  return (
      <footer className="bg-[#F5F5F280] py-6 text-gray-800">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Exclusive */}
        <div>
          <h3 className="text-lg font-semibold">Exclusive</h3>
          <p className="mt-2">Subscribe</p>
          <p className="text-sm text-gray-600">Get 10% off your first order</p>
          <div className="mt-3 flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-l-md bg-white p-2 text-gray-800 focus:outline-none sm:w-48"
            />
            <button className="rounded-r-md bg-gray-700 p-2"></button>
          </div>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold">Support</h3>
          <p className="mt-2 text-gray-600">FPT UNIVERSITY HCM</p>
          <p className="text-gray-600">vynntss170388@fpt.edu.vn</p>
          <p className="text-gray-600">+8438-7502-824</p>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-lg font-semibold">Account</h3>
          <ul className="mt-2 space-y-1 text-gray-600">
  <li  className="hover:text-gray-900 transition-colors duration-200">
    <Link href="/cart" className="hover:text-gray-900 transition-colors duration-200">
      Cart
    </Link>
  </li>
  <li  className="hover:text-gray-900 transition-colors duration-200">
    <Link href="/favorite" className="hover:text-gray-900 transition-colors duration-200">
      Wishlist
    </Link>
  </li>
  <li  className="hover:text-gray-900 transition-colors duration-200">
    <Link href="/product" className="hover:text-gray-900 transition-colors duration-200">
      Shop
    </Link>
  </li>
</ul>
        </div>

        {/* Quick Link */}
        <div>
          <h3 className="text-lg font-semibold">Quick Link</h3>
          <ul className="mt-2 space-y-1 text-gray-600">

            <li>Contact</li>
          </ul>
        </div>

        {/* Download App */}
        <div>
          <h3 className="text-lg font-semibold">Download App</h3>
          <p className="mt-2 text-gray-600">Save $3 with App New User Only</p>
          <div className="mt-3 flex space-x-2">
            {/* <img src="/qr-code.png" alt="QR Code" className="h-16 w-16" /> */}
            <div className="flex flex-col space-y-2">
              {/* <img src="/google-play.png" alt="Google Play" className="w-28" />
              <img src="/app-store.png" alt="App Store" className="w-28" /> */}
            </div>
          </div>
          {/* Social Icons */}
          <div className="mt-4 flex space-x-4 text-xl text-gray-600">
            <i className="fab fa-facebook"></i>
            <i className="fab fa-twitter"></i>
            <i className="fab fa-instagram"></i>
            <i className="fab fa-linkedin"></i>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-4 text-center text-sm text-gray-600">© Copyright Hellen 2022. All right reserved</div>
    </footer>
  );
}
