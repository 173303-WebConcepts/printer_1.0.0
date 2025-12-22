"use client";
import { setItemDetails } from "@/redux/slices/commonSlice";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { FaTags } from "react-icons/fa";
import { FaListUl } from "react-icons/fa6";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import { TbBrandAirtable } from "react-icons/tb";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const Card = ({ icon, title, color, link = "#" }: any) => {
  return (
    <Link href={link} className="bg-base-100 hover:bg-base-200 flex gap-5 rounded-md p-4 transition">
      <div className={`h-fit w-fit rounded-sm p-2.5 ${color}`}>{icon}</div>
      <div className="flex flex-col items-center justify-center">
        <p>{title}</p>
      </div>
    </Link>
  );
};

const ShopSetup = () => {
  const { userId } = useParams(); // ✅ grabs userId from URL

  const { user } = useSelector((state: any) => state.user);

  const router = useRouter();
  const dispatch = useDispatch();

  const handleClickItem = (link: string) => {
    dispatch(setItemDetails(null));
    router.push(link);
  };

  return (
    <div className="container my-[40px]">
      <h5 className="mb-3">
        Setup Shop <span className="text-primary capitalize">({user?.name})</span>
      </h5>

      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card icon={<FaListUl className="text-[22px]" />} title="Category List" color="bg-info/40" link={`/admin/user/category/list/${userId}`} />
        <Card icon={<TbBrandAirtable className="text-[22px]" />} title="Brand List" color="bg-success/40" link={`/admin/user/brand/list/${userId}`} />
        <Card icon={<FaListUl className="text-[22px]" />} title="Product List" color="bg-primary/40" link={`/admin/user/product/list/${userId}`} />
        <div
          className="bg-base-100 hover:bg-base-200 flex gap-5 rounded-md p-4 transition"
          onClick={() => handleClickItem(`/admin/user/product/add/${userId}`)}
        >
          <div className={`bg-primary/40 h-fit w-fit rounded-sm p-2.5`}>
            <MdOutlineAddShoppingCart className="text-[22px]" />
          </div>
          <div className="flex flex-col items-center justify-center">
            <p>Add Product</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopSetup;
