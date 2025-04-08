import Image from "next/image"

const products = [
  {
    id: 1,
    name: "Funkytown® Classic Zipper Hoodie Boxy 2.0",
    price: "620.000 VND",
    image: "https://levents.asia/cdn/shop/files/LightBlue_LHZBXCLE101UB0202FW24_1.jpg?v=1729511098&width=360",
    colors: [
      "https://levents.asia/cdn/shop/files/Tan_LHZBXCLE101UT0402FW24_1.jpg?v=1729511524&width=823",
      "https://levents.asia/cdn/shop/files/Lilas_LHZBXCLE101UL0302FW24_1.jpg?v=1729511386&width=823",
      "https://levents.asia/cdn/shop/files/LightGrey_LHZBXCLE101UG0702FW24_1.jpg?v=1729511288&width=823",
    ],
  },
  {
    id: 2,
    name: "Funkytown® Striped Baseball Jersey",
    price: "620.000 VND",
    image: "https://levents.asia/cdn/shop/files/VintageBlack_LSHOVCOB355UD0102SS24_1.jpg?v=1724224942&width=360",
    colors: [
      "https://levents.asia/cdn/shop/files/VintageBlack_LSHOVCOB355UD0102SS24_1.jpg?v=1724224942&width=360",
      "https://levents.asia/cdn/shop/files/Blue_LSHOVCOB355UB0102SS24_1.jpg?v=1724225176&width=823",
    ],
  },
  {
    id: 3,
    name: "Funkytown® My Garden Semi-Oversize Tee/ Tan",
    price: "420.000 VND",
    image: "https://levents.asia/cdn/shop/files/Tan_LTSSOCOA420UT0400FW24_1.jpg?v=1729691307&width=360",
    colors: ["https://levents.asia/cdn/shop/files/Tan_LTSSOCOA420UT0400FW24_1.jpg?v=1729691307&width=360"],
  },
  {
    id: 4,
    name: "Funkytown® Classic Authentic Hoodie Boxy 2.0",
    price: "620.000 VND",
    image: "https://levents.asia/cdn/shop/files/Black_LHOBXCLD132UD0102FW24_1.jpg?v=1732699435&width=360",
    colors: [
      "https://levents.asia/cdn/shop/files/Black_LHOBXCLD132UD0102FW24_1.jpg?v=1732699435&width=360",
      "https://levents.asia/cdn/shop/files/Tan_LHOBXCLD132UT0402FW24_1.jpg?v=1732699468&width=823",
    ],
  },
]

export default function BestSeller() {
  return (
    <div className="mt-10 w-full px-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex space-x-6 text-xl font-semibold">
          <span className="border-b-2 border-black pb-1">BEST SELLER</span>
          <span className="cursor-pointer text-gray-400 hover:text-black">NEW ARRIVAL</span>
        </div>
        <button className="rounded-md bg-black px-4 py-2 text-sm text-white">Xem tất cả</button>
      </div>

      {/* Product List */}
      <div className="mt-6 grid grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="text-center">
            {/* Product Image */}
            <div className="relative h-[300px] w-full">
              <Image src={product.image} alt={product.name} layout="fill" objectFit="contain" />
            </div>
            {/* Color Options */}
            <div className="mt-2 flex justify-center space-x-2">
              {product.colors.map((color, index) => (
                <Image key={index} src={color} alt="color option" width={20} height={20} className="rounded-full" />
              ))}
            </div>
            {/* Product Name & Price */}
            <p className="mt-2 text-sm">{product.name}</p>
            <p className="font-semibold">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
