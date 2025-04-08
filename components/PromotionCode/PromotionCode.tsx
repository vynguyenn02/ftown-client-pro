import Image from "next/image"

export default function PromotionCode() {
  return (
    <div className="mt-12 flex items-center rounded-xl bg-gray-100 p-12">
      {/* Left Side (Text Content) */}
      <div className="flex-1 pr-8">
        <h2 className="text-4xl font-bold text-black">ƯU ĐÃI ĐẶC BIỆT</h2>
        <p className="mt-4 text-lg text-gray-600">
          Và còn rất nhiều các khuyến mãi khác khi mua sắm tại FunkyTown Gallery.
        </p>
        <button className="mt-6 rounded-md bg-black px-8 py-3 text-xl font-semibold text-white hover:bg-gray-800">
          KHÁM PHÁ NGAY
        </button>
      </div>

      {/* Right Side (Image Content) */}
      <div className="relative ml-12 h-[400px] w-[700px]">
        <Image
          src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1743873183/Frame_3_3_xp1tbm.png"
          alt="Promotion Image"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  )
}
