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
import CustomImage from "@/widgets/CustomImage";
import { FaEye } from "react-icons/fa";
import DeleteModal from "./DeleteModal";
import { FaArrowDownShortWide, FaArrowUpWideShort, FaRegSquarePlus, FaUsersGear } from "react-icons/fa6";
import Filters from "./Filters";
import { setUser } from "@/redux/slices/userSlice";
import { PiProjectorScreenChartDuotone } from "react-icons/pi";
import { setProject } from "@/redux/slices/projectSlice";

function Table() {
  const [data, setData] = useState<any>({});
  const [isLoading, setIsLoading] = useState<any>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);
  const [openBlockUser, setOpenBlockUser] = useState(false);
  const [item, setItem] = useState<any>({});
  const [searchKey, setSearchKey] = useState<any>();
  const [stats, setStats] = useState({
    publishedOriginal: 0,
    publishedClones: 0,
    underReviewProjects: 0,
    inactiveProjects: 0,
  });

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    getCounts();
  }, []);

  useEffect(() => {
    get({ page: 1, pageSize: 10 });
  }, [currentPage]);

  const get = async ({ page, pageSize, ...restFilters }: any) => {
    setIsLoading(true);
    // Remove undefined or empty string values from filters
    const cleanedFilters = Object.fromEntries(Object.entries(restFilters).filter(([key, value]) => key && value !== undefined && value !== ""));

    try {
      const res = await axiosInstance.get("/project/all", {
        params: { page, pageSize, ...cleanedFilters },
      });

      setData(res?.data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // Handle error
    }
  };

  const getCounts = async () => {
    try {
      const res = await axiosInstance.get("/project/counts");

      setStats(res?.data?.data || []);
    } catch (error) {}
  };

  const handleDelete = async ({ _id }: any) => {
    setIsDeleteLoading(true);
    try {
      const res = await axiosInstance.delete(`/project/delete/${_id}`);

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

  const handleEditClick = ({ _id, categoryName, parentCategory }: any) => {
    // dispatch(setCategory({ _id, categoryName, parentCategory }));
    router.push("/admin/category/edit");
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

  const handleViewDetails = (item: any) => {
    dispatch(setProject({ project: { _id: item._id } }));

    router.push("/admin/project/details");
  };

  const statusColorMap: { [key: string]: string } = {
    published: "badge-success bg-success/20 text-success border-success/50", // Green badge-primary bg-primary/20 text-primary border-primary/50
    draft: "badge-primary bg-primary/20 text-primary border-primary/50", // Yellow/Orange
    inActive: "badge-error bg-error/20 text-error border-error/50", // Red
    underReview: "badge-info bg-info/20 text-info border-info/50", // Blue
  };

  return (
    <div className="max-w-screen">
      {/* Cards */}
      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="bg-primary/40 h-fit w-fit rounded-sm p-2.5">
            <PiProjectorScreenChartDuotone className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>Published(Premium)</p>
            <p>{stats.publishedOriginal}</p>
          </div>
        </div>
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="bg-success/40 h-fit w-fit rounded-sm p-2.5">
            <PiProjectorScreenChartDuotone className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>Published(clone)</p>
            <p>{stats.publishedClones}</p>
          </div>
        </div>
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="bg-info/40 h-fit w-fit rounded-sm p-2.5">
            <PiProjectorScreenChartDuotone className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>Under Review</p>
            <p>{stats.underReviewProjects}</p>
          </div>
        </div>
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="bg-error/40 h-fit w-fit rounded-sm p-2.5">
            <PiProjectorScreenChartDuotone className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>In-Active</p>
            <p>{stats.inactiveProjects}</p>
          </div>
        </div>
      </div>

      <Filters get={(restFilters: any) => get({ page: 1, pageSize: 10, [searchKey]: searchValue?.trim(), ...restFilters })} />

      <div className="border-neutral bg-base-100 max-w-full rounded-md border shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <header className="flex items-center justify-start gap-5 px-5 py-4">
            <h3 className="flex gap-3 text-left font-semibold">Project Information {isLoading != null && isLoading && <Spinner />}</h3>
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
                  <th>
                    <div>title</div>
                  </th>
                  <th className={`cursor-pointer ${searchKey == "email" && "bg-primary text-primary-content"}`} onClick={() => setSearchKey("email")}>
                    <div>likes</div>
                  </th>
                  <th>
                    <div>unlocks</div>
                  </th>
                  <th>
                    <div>isClone</div>
                  </th>
                  <th>
                    <div>status</div>
                  </th>
                  <th>
                    <div>posted Time</div>
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
                ) : data && data.projects?.length > 0 ? (
                  data.projects.map((item: any, index: any) => {
                    return (
                      <tr key={index} className="border-b-dark-2/60 border-b text-center">
                        <td>
                          <div className="uppercase">{item._id?.slice(-4)}</div>
                        </td>
                        <td>
                          <div className="flex flex-col items-center justify-center">
                            {item.avatar && item.avatar && (
                              <div className="relative h-12 w-12">
                                <CustomImage
                                  src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/v1234567890/${item.avatar}`}
                                />
                              </div>
                            )}

                            {item.title}
                          </div>
                        </td>
                        <td>{item.likes}</td>
                        <td>{item.unlocks}</td>
                        <td>
                          <div
                            className={`badge ${item.isClone ? "badge-primary bg-primary/20 text-primary border-primary/50" : "badge-info bg-info/20 text-info border-info/50"}`}
                          >
                            {item.isClone ? "Yes" : "No"}
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${statusColorMap[item.status] || "badge-neutral"}`}>{item.status}</div>{" "}
                        </td>

                        <td>{moment(item.postedTime).format("DD MMM, YYYY")}</td>
                        <td>
                          {moment(item.createdAt).format("DD MMM, YYYY")} <br /> {moment(item.updatedAt).format("DD MMM, YYYY")}{" "}
                        </td>

                        <td className="gap-5 p-2">
                          <div className="flex min-h-full w-full justify-center gap-5">
                            <div onClick={() => handleViewDetails(item)}>
                              <FaEye className="cursor-pointer" size={25} />
                            </div>

                            {/* <div className="cursor-pointer" onClick={() => handleEditClick(item)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="text-primary h-6 w-6"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                />
                              </svg>
                            </div> */}
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
                          No User Found
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
          {data && data.users?.length > 0 && (
            <div className="mt-10 flex justify-end pb-3">{<Paginations paginationData={data?.paginationData} onPageChange={handlePageChange} />}</div>
          )}
        </div>
      </div>

      <DeleteModal open={open} setOpen={setOpen} onClick={() => handleDelete({ _id: item._id })} isDeleteLoading={isDeleteLoading} />
    </div>
  );
}

export default Table;
