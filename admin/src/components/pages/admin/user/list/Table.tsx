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
import { FaArrowDownShortWide, FaArrowUpWideShort, FaRegSquarePlus, FaShop, FaUsersGear } from "react-icons/fa6";
import Filters from "./Filters";
import { GiHouseKeys } from "react-icons/gi";
import BlockUserModal from "./BlockUserModal";
import { setUser, setUserDetails } from "@/redux/slices/userSlice";
import { Helper } from "@/utils/Helper";
import { FiEdit } from "react-icons/fi";

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
    totalUsers: 0,
    totalAdmins: 0,
    totalBlocked: 0,
    totalPremium: 0,
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
      const res = await axiosInstance.get("/user/all", {
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
      const res = await axiosInstance.get("/user/counts");

      setStats(res?.data?.data || []);
    } catch (error) {}
  };

  const handleDelete = async ({ _id }: any) => {
    setIsDeleteLoading(true);
    try {
      const res = await axiosInstance.delete(`/user/delete/${_id}`);

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

  const handleBlockUser = async ({ userId, isBlocked }: any) => {
    setIsDeleteLoading(true);
    try {
      const res = await axiosInstance.put(`/user/block`, { userId, isBlocked });

      if (res?.data?.success) {
        setOpenBlockUser(false);
        get({ page: currentPage });
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
    dispatch(setUserDetails(item));
    router.push("/admin/user/add");
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
    dispatch(setUser({ user: item }));

    router.push("/admin/user/details");
  };

  const handleShopClick = (item: any) => {
    dispatch(setUser({ user: item }));
    router.push(`/admin/user/shop-setup/${item._id}`);
  };

  const handleAddNewClick = () => {
    dispatch(setUserDetails({}));
    router.push(`/admin/user/add`);
  };

  return (
    <div className="max-w-screen">
      {/* Cards */}
      <div className="mb-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="h-fit w-fit rounded-sm bg-slate-500/40 p-2.5">
            <FaUsersGear className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>Total Users</p>
            <p>{stats.totalUsers}</p>
          </div>
        </div>
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="bg-success/40 h-fit w-fit rounded-sm p-2.5">
            <FaUsersGear className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>Premimum</p>
            <p>{stats.totalPremium}</p>
          </div>
        </div>
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="bg-primary/40 h-fit w-fit rounded-sm p-2.5">
            <FaUsersGear className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>Admin</p>
            <p>{stats.totalAdmins}</p>
          </div>
        </div>
        <div className="bg-base-100 flex gap-5 rounded-md p-4">
          <div className="bg-error/40 h-fit w-fit rounded-sm p-2.5">
            <FaUsersGear className="text-[22px]" />
          </div>

          <div className="flex flex-col items-center justify-center">
            <p>Blocked</p>
            <p>{stats.totalBlocked}</p>
          </div>
        </div>
      </div>

      <Filters get={(restFilters: any) => get({ page: 1, pageSize: 10, [searchKey]: searchValue?.trim(), ...restFilters })} />

      <div className="mt-5 mb-2 flex justify-end gap-5">
        <button className="btn btn-primary capitalize" type="button" onClick={handleAddNewClick}>
          Add new user
        </button>
      </div>

      <div className="border-neutral bg-base-100 max-w-full rounded-md border shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <header className="flex items-center justify-start gap-5 px-5 py-4">
            <h3 className="flex gap-3 text-left font-semibold">User Information {isLoading != null && isLoading && <Spinner />}</h3>
            {searchKey && (
              <button
                className="btn btn-sm btn-error mr-2"
                onClick={() => {
                  setSearchKey("");
                }}
              >
                <MdOutlineFilterListOff className="text-[19px]" />
                Clear Filters
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
                    <div>Shop Name</div>
                  </th>
                  <th className={`cursor-pointer ${searchKey == "phone" && "bg-primary text-primary-content"}`} onClick={() => setSearchKey("phone")}>
                    <div>Phone</div>
                  </th>
                  <th>
                    <div>Role</div>
                  </th>
                  <th>
                    <div>Shop Type</div>
                  </th>
                  <th className="w-[200px]">
                    <div>Is Premium</div>
                  </th>
                  <th>
                    <div>Is Block</div>
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
                ) : data && data.users?.length > 0 ? (
                  data.users.map((item: any, index: any) => {
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

                            {item.name}
                          </div>
                        </td>
                        <td>(+92) {item.phone}</td>
                        <td>
                          <div>
                            <p
                              className={`badge ${item.role === "user" ? "badge-primary bg-primary/20 text-primary border-primary/50" : "badge-error bg-error/20 text-error border-error/50"}`}
                            >
                              {item.role}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            <p className={`badge "badge-info bg-info/20 text-info border-info/50"`}>{item.shopType?.type}</p>
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const daysLeft = Helper.getDaysLeft(item.premiumExpiry);

                            if (!item.isPremium || !item.premiumExpiry) {
                              return <p className="badge badge-error bg-error/20 text-error border-error/50">Not Premium</p>;
                            }

                            return (
                              <p
                                className={`badge ${
                                  daysLeft <= 0
                                    ? "badge-error bg-error/20 text-error border-error/50"
                                    : "badge-primary bg-primary/20 text-primary border-primary/50"
                                }`}
                              >
                                {daysLeft <= 0 ? "Expired" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
                              </p>
                            );
                          })()}
                        </td>

                        <td>
                          {item?.isBlocked ? (
                            <button
                              className={`btn btn-xs btn-error min-w-fit`}
                              onClick={() => {
                                setOpenBlockUser(true);
                                setItem({ ...item, isBlocked: false });
                              }}
                            >
                              Un Block
                            </button>
                          ) : (
                            <button
                              className={`btn btn-xs btn-primary min-w-fit`}
                              onClick={() => {
                                setOpenBlockUser(true);
                                setItem({ ...item, isBlocked: true });
                              }}
                            >
                              Block
                            </button>
                          )}
                        </td>
                        <td>
                          {moment(item.createdAt).format("DD MMM, YYYY")} <br /> {moment(item.updatedAt).format("DD MMM, YYYY")}{" "}
                        </td>
                        <td className="gap-5 p-2">
                          <div className="flex min-h-full w-full justify-center gap-5">
                            <div onClick={() => handleShopClick(item)}>
                              <FaShop className="text-success cursor-pointer" size={25} />
                            </div>
                            <div onClick={() => handleViewDetails(item)}>
                              <FaEye className="text-info cursor-pointer" size={25} />
                            </div>

                            <FiEdit className={`text-primary cursor-pointer`} size={25} onClick={() => handleEditClick(item)} />

                            {/* <MdDeleteForever className="cursor-pointer text-red-500" size={25} onClick={() => handleDeleteClick(item)} /> */}
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
      <BlockUserModal
        open={openBlockUser}
        setOpen={setOpenBlockUser}
        onClick={() => handleBlockUser({ userId: item._id, isBlocked: item.isBlocked })}
        isDeleteLoading={isDeleteLoading}
        userId={item._id}
        isBlocked={item.isBlocked}
      />
    </div>
  );
}

export default Table;
