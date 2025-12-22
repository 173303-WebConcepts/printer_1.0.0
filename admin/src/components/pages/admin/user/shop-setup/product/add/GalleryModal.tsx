"use client";
import { axiosInstance } from "@/utils/axios";
import CustomImage from "@/widgets/CustomImage";
import Toast from "@/widgets/CustomToast";
import Spinner from "@/widgets/Spinner";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Paginations } from "@/widgets/Paginations"; // ✅ same as user table
import { Helper } from "@/utils/Helper";

const GalleryModal = ({ open, setOpen, setFieldValue, imageValue }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [shopTypes, setShopTypes] = useState<any[]>([]);
  const [data, setData] = useState<any>({}); // ✅ store galleries + pagination data
  const [selectedShopType, setSelectedShopType] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  /** 🧠 Fetch both shop types and galleries when modal opens */
  useEffect(() => {
    if (open) fetchInitialData({ page: 1 });
  }, [open]);

  /** 🧠 Fetch again when page changes */
  useEffect(() => {
    if (open) {
      if (selectedShopType) fetchGalleriesByShopType(selectedShopType.value, currentPage);
      else fetchInitialData({ page: currentPage });
    }
  }, [currentPage]);

  /** 📦 Initial data load */
  const fetchInitialData = async ({ page }: { page: number }) => {
    setIsLoading(true);
    try {
      const [shopTypeRes, galleryRes] = await Promise.all([
        axiosInstance.get("/user/shoptypes"),
        axiosInstance.get("/user/galleries", { params: { page, pageSize: 10 } }),
      ]);
      setShopTypes(shopTypeRes?.data?.data?.shoptypes || []);
      setData(galleryRes?.data?.data || {});
    } catch (error) {
      Toast.error("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  };

  /** 🔍 Filter galleries by shopType + page */
  const fetchGalleriesByShopType = async (shopTypeId: string, page: number) => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/user/galleries", {
        params: { page, pageSize: 10, shopType: shopTypeId },
      });
      setData(res?.data?.data || {});
    } catch (error) {
      Toast.error("Failed to fetch filtered galleries");
    } finally {
      setIsLoading(false);
    }
  };

  /** ✅ Handle checkbox selection */
  const handleCheckboxChange = (image: string, checked: boolean) => {
    if (checked) setFieldValue("image", image);
    else setFieldValue("image", "");
  };

  /** 🔄 Pagination handler */
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const customStyles = Helper.reactSelectStyles

  return (
    <dialog id="add-new-category" className={`modal ${open ? "modal-open" : "modal-close"}`}>
      <div className="modal-box md:min-w-[800px]">
        {/* ❌ Close */}
        <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2" onClick={() => setOpen(false)}>
          ✕
        </button>

        {/* 🧭 Header */}
        <div className="border-b-base-content-20 border-b pb-3">
          <h3 className="flex items-center gap-2 text-lg font-bold">Add Image</h3>
          <p>
            Choose image from below or{" "}
            <Link href={`/admin/gallery/add`} className="text-primary capitalize underline">
              add a new one
            </Link>
            .
          </p>
        </div>

        {/* 🏬 ShopType Filter */}
        <div className="bg-base-100 mt-5 flex items-end gap-2 rounded-md">
          <div className="w-[50%]">
            <Select
              classNamePrefix="select"
              placeholder="Select Shop Type..."
              isLoading={isLoading}
              options={shopTypes.map((item: any) => ({
                label: item.type,
                value: item._id,
              }))}
              value={selectedShopType}
              onChange={(selected) => {
                setSelectedShopType(selected);
                setCurrentPage(1);
                if (selected) fetchGalleriesByShopType(selected.value, 1);
                else fetchInitialData({ page: 1 });
              }}
              isClearable
              isSearchable
              styles={customStyles}
            />
          </div>
        </div>

        {/* 🖼️ Gallery Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {isLoading ? (
            <div className="col-span-full text-center">
              <Spinner />
            </div>
          ) : data?.galleries?.length ? (
            data.galleries.map((item: any, index: number) => (
              <div key={item._id || index}>
                <label className="mb-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    onChange={(e) => handleCheckboxChange(item.image, e.target.checked)}
                    checked={item.image === imageValue}
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
            <div className="col-span-full text-center">No images found</div>
          )}
        </div>

        {/* 📄 Pagination */}
        {data?.paginationData && data?.paginationData?.documentCount > 0 && (
          <div className="mt-10 flex justify-end pb-3">
            <Paginations paginationData={data?.paginationData} onPageChange={handlePageChange} />
          </div>
        )}
      </div>
    </dialog>
  );
};

export default GalleryModal;
