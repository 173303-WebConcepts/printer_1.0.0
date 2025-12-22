"use client";
import Toast from "@/widgets/CustomToast";
import Spinner from "@/widgets/Spinner";
import { axiosInstance } from "@/utils/axios";
import { debounce, each } from "lodash";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import { IoSearchOutline, IoWalletOutline } from "react-icons/io5";
import { MdDeleteForever, MdOutlineFilterListOff } from "react-icons/md";
import { useDispatch } from "react-redux";
import moment from "moment";
import { Paginations } from "@/widgets/Paginations";
import { FaEye } from "react-icons/fa";
import DeleteModal from "./DeleteModal";
import { setProject } from "@/redux/slices/projectSlice";
import AddCategory from "./AddCategory";
import { FiEdit } from "react-icons/fi";
import { setItemDetails } from "@/redux/slices/commonSlice";

function Table() {
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<any>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<any>({});
  const [searchKey, setSearchKey] = useState<any>();

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    get({ page: 1, pageSize: 10 });
  }, [currentPage]);

  const get = async ({ page, pageSize, ...restFilters }: any) => {
    setIsLoading(true);
    // Remove undefined or empty string values from filters
    const cleanedFilters = Object.fromEntries(Object.entries(restFilters).filter(([key, value]) => key && value !== undefined && value !== ""));

    try {
      const res = await axiosInstance.get("/category/user-brands", {
        params: { page, pageSize, ...cleanedFilters },
      });

      setData(res?.data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // Handle error
    }
  };

  const handleDelete = async ({ _id }: any) => {
    setIsDeleteLoading(true);
    try {
      const res = await axiosInstance.delete(`/category/brand/delete/${_id}`);

      if (res?.data?.success) {
        setOpen(false);
        get({ page: currentPage, pageSize: 10 });
        return Toast.success(res?.data?.message);
      }
    } catch (error) {
      Toast.error("ERROR!");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(currentPage);
    get({ page, title: searchValue });
  };

  const handleEditClick = (item: any) => {
    dispatch(setItemDetails(item));;
  };

  // Debounced function
  const handleFilterDebounced = useCallback(
    debounce((val) => {
      const key = searchKey?.trim() || "_id";
      setCurrentPage(1);
      setSearchValue(val);
      get({ page: 1, pageSize: 10, [key]: val?.trim() });
    }, 800), // 800ms debounce delay
    [searchKey]
  );

  const handleDeleteClick = (item: any) => {
    setItem(item);
    setOpen(true);
  };

  return (
    <div className="max-w-screen">
      <AddCategory refreshCategories={() => get({ page: 1, pageSize: 10 })} />

      <div className="border-neutral bg-base-100 max-w-full rounded-md border shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <header className="flex items-center justify-start gap-5 px-5 py-4">
            <h3 className="flex gap-3 text-left font-semibold">Brand Information {isLoading != null && isLoading && <Spinner />}</h3>
            {searchKey && (
              <button className="btn btn-sm btn-error mr-2" onClick={() => setSearchKey("")}>
                <MdOutlineFilterListOff className="text-[19px]" />
                Clear FIlters
              </button>
            )}
          </header>

          {/* Search input */}
          <label className="input input-bordered mx-2 mb-1 flex min-w-[320px] items-center gap-2 self-end">
            <input type={"text"} className="grow" placeholder={"Search here"} onChange={(e) => handleFilterDebounced(e.target.value)} />
            <span>
              <IoSearchOutline />
            </span>
          </label>
        </div>

        <div className="max-w-full p-3">
          <p className="mb-1">Results: {data?.paginationData?.documentCount}</p>
          {/* Table */}
          <div className="rounded-box border-dark-2/60 bg-base-100 max-w-full overflow-x-auto border">
            <table className="table">
              {/* Table header */}
              <thead className="bg-base-300 text-center text-xs font-semibold uppercase">
                <tr>
                  <th className={`cursor-pointer ${searchKey == "_id" && "bg-primary text-primary-content"}`} onClick={() => setSearchKey("_id")}>
                    <div>ID</div>
                  </th>
                  <th className={`cursor-pointer ${searchKey == "name" && "bg-primary text-primary-content"}`} onClick={() => setSearchKey("name")}>
                    <div>name</div>
                  </th>
                  <th>
                    <div>Shop Type</div>
                  </th>

                  <th>
                    <div>Created / Updated</div>
                  </th>
                  <th>
                    <div>Action</div>
                  </th>
                </tr>
              </thead>
              {/* Table body */}
              <tbody>
                {isLoading != null && isLoading ? (
                  <Fragment>
                    <tr>
                      <td colSpan={10} className="pt-10 text-center">
                        <Spinner />
                      </td>
                    </tr>
                  </Fragment>
                ) : data && data.brands?.length > 0 ? (
                  data.brands.map((item: any, index: any) => {
                    return (
                      <tr key={index} className="border-b-dark-2/60 border-b text-center">
                        <td>
                          <div className="uppercase">{item._id?.slice(-4)}</div>
                        </td>

                        <td>
                          <div className={`badge badge-primary bg-primary/20 text-primary border-primary/50`}>{item.name}</div>{" "}
                        </td>

                        <td>
                          <div className={`badge badge-info bg-info/20 text-info border-info/50`}>{item.shopType?.type}</div>{" "}
                        </td>

                        <td>
                          {moment(item.createdAt).format("DD MMM, YYYY")} <br /> {moment(item.updatedAt).format("DD MMM, YYYY")}{" "}
                        </td>

                        <td className="gap-5 p-2">
                          <div className="flex min-h-full w-full justify-center gap-5">
                            <FiEdit className="text-primary cursor-pointer" size={25} onClick={() => handleEditClick(item)} />

                            <MdDeleteForever className="cursor-pointer text-red-500" size={25} onClick={() => handleDeleteClick(item)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <>
                    {isLoading != null && (
                      <tr>
                        <td colSpan={10} className="pt-10 text-center">
                          Not Found
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          {data && data.brands?.length > 0 && (
            <div className="mt-10 flex justify-end pb-3">{<Paginations paginationData={data?.paginationData} onPageChange={handlePageChange} />}</div>
          )}
        </div>
      </div>

      <DeleteModal open={open} setOpen={setOpen} onClick={() => handleDelete({ _id: item._id })} isDeleteLoading={isDeleteLoading} />
    </div>
  );
}

export default Table;
