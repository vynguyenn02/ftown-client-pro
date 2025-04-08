export default function Advertise() {
    return (
      <div className="mt-12 flex items-center bg-gray-100 p-12">
        {/* Video bên trái */}
        <div className="relative mr-12 h-[400px] w-[700px]">
          <video
            src="https://levents.asia/cdn/shop/videos/c/vp/a1253f643ff14db69888ca8aff25e5fd/a1253f643ff14db69888ca8aff25e5fd.HD-1080p-7.2Mbps-40102862.mp4?v=0" // Thay URL video của bạn vào đây
            className="w-full h-full rounded-lg"
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          />
        </div>
  
        {/* Nội dung bên phải */}
        <div className="flex-1 pl-8">
          <h2 className="text-4xl font-bold text-black">ADORABLE DREAMS</h2>
          <p className="mt-4 text-lg text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin iaculis porta luctus. Nulla pharetra ornare ligula eget faucibus. Maecenas a commodo massa, vitae faucibus lectus. Suspendisse potenti.
          </p>
          <p className="mt-2 text-lg text-gray-600">
            Designed for dreamers who find beauty in the little things, it serves as a gentle reminder that love, 
            friendship, and imagination are the true colors of life.
          </p>
          <button className="mt-6 rounded-md bg-black px-8 py-3 text-xl font-semibold text-white hover:bg-gray-800">
            XEM THÊM
          </button>
        </div>
      </div>
    )
  }
  