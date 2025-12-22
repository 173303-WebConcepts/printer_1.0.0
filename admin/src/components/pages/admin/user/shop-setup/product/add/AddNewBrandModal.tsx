"use client";
import { axiosInstance } from "@/utils/axios";
import { Helper } from "@/utils/Helper";
import Toast from "@/widgets/CustomToast";
import Spinner from "@/widgets/Spinner";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const AddNewBrandModal = ({ open, setOpen, onClick, isDeleteLoading, refetchData }: any) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // ✅ Track checked categories

  const { user } = useSelector((state: any) => state.user);
  const { userId } = useParams();

  useEffect(() => {
    if (open) get({ page: 1, pageSize: 10 });
  }, [open]);

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
  const handleCheckboxChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(
      (prev) =>
        checked
          ? [...prev, categoryId] // add
          : prev.filter((id) => id !== categoryId) // remove
    );
  };

  // ✅ Submit selected categories to API
  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      Toast.warn("Please select at least one brand.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await axiosInstance.put("/category/add-user-to-brands", {
        brandIds: selectedCategories,
        userId,
      });

      if (res?.data?.success) {
        Helper.res(res);
        refetchData();
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Error adding categories:", error);
      Helper.res(error);
    } finally {
      setIsLoading(false);
    }
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
            <h3 className="flex items-center gap-2 text-lg font-bold">
              Add New Brand <span className="text-primary capitalize">({user?.shopType?.type})</span>
            </h3>
            <p className="">
              Choose brands from below or{" "}
              <Link href={`/admin/user/brand/list/${userId}`} className="text-primary capitalize underline">
                add a new one
              </Link>
              .
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {isLoading ? (
              <div className="col-span-full text-center">{<Spinner />}</div>
            ) : data?.brands?.length ? (
              data.brands.map((item: any, index: any) => (
                <label key={item._id || index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    onChange={(e) => handleCheckboxChange(item._id, e.target.checked)}
                    checked={selectedCategories.includes(item._id)}
                  />
                  <span className="capitalize">{item.name}</span>
                </label>
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

export default AddNewBrandModal;
