import Image from "next/image"
import Link from "next/link"
export default function Banner() {
  return (
    <div className="relative h-[500px] w-full md:h-screen">
      <Image
        src="https://res.cloudinary.com/dqjtkdldj/image/upload/v1743743707/Frame_2_zy28xh.png"
        alt="Banner"
        layout="fill"
        objectFit="contain"
        priority
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <Link href = "/product">
        <button className="mt-4 rounded-lg bg-white px-6 py-2 font-semibold text-black shadow-md hover:bg-gray-300">
          Xem sản phẩm
        </button>
        </Link>
       
      </div>
    </div>
  )
}
