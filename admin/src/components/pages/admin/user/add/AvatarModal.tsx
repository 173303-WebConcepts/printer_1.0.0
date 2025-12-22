"use client";
import { axiosInstance } from "@/utils/axios";
import { Helper } from "@/utils/Helper";
import CustomImage from "@/widgets/CustomImage";
import Toast from "@/widgets/CustomToast";
import Spinner from "@/widgets/Spinner";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AvatarModal = ({ open, setOpen, isDeleteLoading, setFieldValue, imageValue }: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [data2, setData2] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // ✅ Track checked categories
  const [currentPage, setCurrentPage] = useState(1);

  const { user } = useSelector((state: any) => state.user);
  const { userId } = useParams();

  useEffect(() => {
    if (open) get({ page: 1, pageSize: 10 });
  }, [open]);

  useEffect(() => {
    get2({ page: 1, pageSize: 10 });
  }, [currentPage]);

  const get2 = async ({ page, pageSize, ...restFilters }: any) => {
    setIsLoading(true);
    // Remove undefined or empty string values from filters
    const cleanedFilters = Object.fromEntries(Object.entries(restFilters).filter(([key, value]) => key && value !== undefined && value !== ""));

    try {
      const res = await axiosInstance.get("/user/galleries", {
        params: { page, pageSize, ...cleanedFilters },
      });

      setData2(res?.data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // Handle error
    }
  };

  const get = async ({ page, pageSize, ...restFilters }: any) => {
    setIsLoading(true);
    const cleanedFilters = Object.fromEntries(Object.entries(restFilters).filter(([, value]) => value !== undefined && value !== ""));

    try {
      const res = await axiosInstance.get("/category/shop-type-brands", { params: { shopType: user?.shopType?._id } });

      setData(res?.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle checkbox change
  const handleCheckboxChange = (image: string, checked: boolean) => {
    if (checked) {
      setFieldValue("image", image);
    } else {
      setFieldValue("image", ""); // clear the field
    }
  };

  // ✅ Submit selected categories to API
  const handleSubmit = async () => {
    setOpen(false);
  };

  return (
    <div>
      <dialog id="add-new-category" className={`modal ${open ? "modal-open" : "modal-close"}`}>
        <div className="modal-box md:min-w-[800px]">
          <form method="dialog">
            <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2" onClick={() => setOpen(false)}>
              ✕
            </button>
          </form>

          <div className="border-b-base-content-20 border-b pb-3">
            <h3 className="flex items-center gap-2 text-lg font-bold">Add Avatar</h3>
            <p className="">
              Choose avatar from below or{" "}
              <Link href={`/admin/gallery/image/add`} className="text-primary capitalize underline">
                add a new one
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {isLoading ? (
              <div className="col-span-full text-center">{<Spinner />}</div>
            ) : data2?.galleries?.length ? (
              data2?.galleries?.map((item: any, index: any) => (
                <div>
                  <label key={item._id || index} className="mb-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      onChange={(e) => handleCheckboxChange(item.image, e.target.checked)}
                      checked={item.image == imageValue}
                    />
                    <span className="capitalize">{item.name}</span>
                  </label>
                  <div className="relative h-24 w-24">
                    <CustomImage
                      src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/v1234567890/${item.image}`}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center">Not Found</div>
            )}
          </div>

          <div className="mt-7 flex justify-end">
            <button type="button" className="btn btn-primary" disabled={isDeleteLoading || isLoading} onClick={handleSubmit}>
              Submit {(isDeleteLoading || isLoading) && <Spinner colorClass="!text-neutral" />}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default AvatarModal;
