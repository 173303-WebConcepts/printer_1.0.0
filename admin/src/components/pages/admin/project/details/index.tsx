"use client";
import { axiosInstance } from "@/utils/axios";
import Collapse from "@/widgets/Collapse";
import CustomImage from "@/widgets/CustomImage";
import Toast from "@/widgets/CustomToast";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";
import { AiFillLike, AiFillUnlock } from "react-icons/ai";
import { BiDollar, BiLogoGmail } from "react-icons/bi";
import { FaLinkedin } from "react-icons/fa";
import { FaRegCircleDot } from "react-icons/fa6";
import { GoInfo } from "react-icons/go";
import { GrTechnology } from "react-icons/gr";
import { IoEarthOutline } from "react-icons/io5";
import { LiaIndustrySolid } from "react-icons/lia";
import { SiFiverr } from "react-icons/si";
import { TbBusinessplan } from "react-icons/tb";
import { useSelector } from "react-redux";

const CollapseWithList = ({ data, heading }: { data: string[]; heading: string }) => {
  return (
    <Fragment>
      <Collapse title={`List of ${heading}`}>
        {data?.map((item: string, index: number) => (
          <li key={index} className="flex items-center gap-5">
            <FaRegCircleDot className="" />
            {item}
          </li>
        ))}
      </Collapse>
    </Fragment>
  );
};

const Skeleton = () => {
  return (
    <div className="container mx-auto py-20">
      <div className="grid grid-cols-2 gap-10">
        {/* Left */}
        <div className="space-y-2">
          <div className="skeleton bg-base-100/50 h-[20px] w-[100px]"></div>
          <div className="skeleton bg-base-100/50 h-[400px]"></div>
        </div>

        {/* Right */}
        <div className="space-y-2">
          <div className="flex gap-5">
            <div className="skeleton bg-base-100/50 h-[20px] flex-1"></div>
            <div className="skeleton bg-base-100/50 h-[20px] flex-1"></div>
            <div className="skeleton bg-base-100/50 h-[20px] flex-1"></div>
            <div className="skeleton bg-base-100/50 h-[20px] flex-1"></div>
            <div className="skeleton bg-base-100/50 h-[20px] flex-1"></div>
            <div className="skeleton bg-base-100/50 h-[20px] flex-1"></div>
          </div>

          <div className="skeleton bg-base-100/50 h-[400px]"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
        {/* Left */}
        <div className="mt-10 space-y-10">
          <div className="space-y-2">
            <div className="skeleton bg-base-100/50 h-[20px] w-[180px]"></div>
            <div className="skeleton bg-base-100/50 h-[200px]"></div>
          </div>
          <div className="space-y-2">
            <div className="skeleton bg-base-100/50 h-[20px] w-[180px]"></div>
            <div className="skeleton bg-base-100/50 h-[200px]"></div>
          </div>
          <div className="space-y-2">
            <div className="skeleton bg-base-100/50 h-[20px] w-[180px]"></div>
            <div className="skeleton bg-base-100/50 h-[200px]"></div>
          </div>
        </div>

        {/* Right */}
        <div className="mt-10 space-y-10">
          <div className="skeleton bg-base-100/50 h-[360px]"></div>
          <div className="skeleton bg-base-100/50 h-[360px]"></div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetails = () => {
  const { project } = useSelector((state: any) => state.project);

  const [data, setData] = useState<any>({});
  const [isLiked, setIsLiked] = useState<any>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<Boolean>(false);

  useEffect(() => {
    if (project?._id) {
      get();
    }
  }, [project._id]);

  const get = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(`/project/details/${project?._id}`);

      setData(res?.data?.data?.project);
      setLikeCount(res?.data?.data?.project?.likes || 0);
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const newLikeState = !isLiked;

      // Optimistically update UI
      setIsLiked(newLikeState);
      setLikeCount((prev) => (newLikeState ? prev + 1 : Math.max(prev - 1, 0)));

      // Send to backend
      await axiosInstance.put(`/project/like`, {
        projectId: project?._id,
        isLiked: newLikeState,
      });
    } catch (error) {
      Toast.error("Failed to like project:");

      // Revert UI change on failure
      setIsLiked((prev: any) => !prev);
      setLikeCount((prev) => (isLiked ? prev + 1 : Math.max(prev - 1, 0)));
    }
  };

  return (
    <Fragment>
      {isLoading ? (
        <Skeleton />
      ) : (
        <div className="container mx-auto py-20">
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-10">
            {/* Left */}
            <div>
              <div>
                <p className="mb-2 text-xl font-semibold uppercase">#{data?._id?.slice(-4)}</p>
                <div className="mb-2 block lg:hidden">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="flex items-center justify-center gap-1 rounded-2xl bg-rose-300 px-3 text-[13px] text-black capitalize">
                      <LiaIndustrySolid />
                      {data?.industry?.name}{" "}
                    </p>
                    <p className="flex items-center justify-center gap-1 rounded-2xl bg-rose-300 px-3 text-[13px] text-black capitalize">
                      <TbBusinessplan />
                      {data?.businessModel?.name}{" "}
                    </p>
                    <p className="flex items-center justify-center gap-1 rounded-2xl bg-rose-300 px-3 text-[13px] text-black capitalize">
                      <GrTechnology />
                      {data?.technology?.name}{" "}
                    </p>
                  </div>
                </div>
                <div className="relative h-[300px] w-full rounded-md transition-transform duration-500 ease-in-out group-hover:scale-110 lg:h-[400px]">
                  <CustomImage
                    className="!h-full !w-full rounded-md"
                    src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/v1234567890/${data?.thumbnail && data?.thumbnail}`}
                  />
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="space-y-2">
              <div>
                <div className="flex flex-wrap gap-5 lg:mt-1">
                  <div className="flex cursor-pointer items-center gap-1" onClick={handleLike}>
                    {/* <AiOutlineLike className="text-lg" /> */}
                    <AiFillLike className={`text-lg ${isLiked ? "text-primary" : ""}`} />
                    <p>{likeCount}</p>
                  </div>

                  {!data?.isClone && (
                    <div className="flex items-center gap-1">
                      <AiFillUnlock className="text-lg" />
                      <p>{data?.unlocks}</p>
                    </div>
                  )}

                  <div className="flex items-center">
                    <BiDollar className="text-lg" />
                    <p className="capitalize">{data?.budget?.reduce((total: any, item: any) => total + Number(item.amount || 0), 0)}</p>
                  </div>

                  <div className="hidden lg:block">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="flex items-center justify-center gap-1 rounded-2xl bg-rose-300 px-3 text-[13px] text-black capitalize">
                        <LiaIndustrySolid />
                        {data?.industry?.name}{" "}
                      </p>
                      <p className="flex items-center justify-center gap-1 rounded-2xl bg-rose-300 px-3 text-[13px] text-black capitalize">
                        <TbBusinessplan />
                        {data?.businessModel?.name}{" "}
                      </p>
                      <p className="flex items-center justify-center gap-1 rounded-2xl bg-rose-300 px-3 text-[13px] text-black capitalize">
                        <GrTechnology />
                        {data?.technology?.name}{" "}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 min-h-[400px] rounded-md p-5">
                <h4>{data?.title}</h4>
                <p>{data?.description}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="space-y-8">
              {data?.problems && data?.problems.length > 0 && (
                <div>
                  <h4 className="mb-1 capitalize">Problems</h4>

                  <CollapseWithList data={data?.problems} heading="problems" />
                </div>
              )}

              {data?.solutions && data?.solutions.length > 0 && (
                <div>
                  <h4 className="mb-1 capitalize">Solutions</h4>

                  <CollapseWithList data={data?.solutions} heading="solutions" />
                </div>
              )}

              <div>
                <h4 className="mb-1 capitalize">Target Audience</h4>

                <CollapseWithList data={data?.targetAudience} heading="target audience" />
              </div>
              <div>
                <h4 className="mb-1 capitalize">Competitors</h4>

                <Collapse title={`List of competitors`}>
                  {data?.competitors?.map((item: string, index: number) => (
                    <li key={index} className="flex items-center gap-5">
                      <FaRegCircleDot className="" />
                      <Link href={item} target="_blank" className="text-primary underline">
                        {item}
                      </Link>
                    </li>
                  ))}
                </Collapse>
              </div>
              <div>
                <h4 className="mb-1 capitalize">Features</h4>

                <CollapseWithList data={data?.features} heading="features" />
              </div>
            </div>

            <div>
              <div>
                <h4 className="mt-8 mb-1 capitalize">Hire team for this project</h4>
                <div className="bg-base-100 rounded-md p-5">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="relative h-[200px] w-[200px] rounded-full transition-transform duration-500 ease-in-out group-hover:scale-110">
                      <CustomImage className="!h-full !w-full !rounded-full" src={`/images/avatar.png`} />
                    </div>
                    <h5>Tamato Candlez</h5>
                    <div>
                      <div className="flex w-full flex-col gap-3 text-gray-400 lg:flex-row">
                        <p>tamatocandlez@gmail.com</p>
                        <div className="border-r-dark-2 border-r-2"></div>
                        <p>tamatocandlez.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="mx-auto mt-10 flex w-fit items-center gap-3">
                    <Link href="/" className="bg-base-200 hover:bg-base-200/50 flex w-fit items-center justify-center rounded-full p-4">
                      <SiFiverr className="text-3xl text-green-400" />
                    </Link>
                    <Link href="/" className="bg-base-200 hover:bg-base-200/50 flex w-fit items-center justify-center rounded-full p-4">
                      <BiLogoGmail className="text-3xl text-red-400" />
                    </Link>
                    <Link href="/" className="bg-base-200 hover:bg-base-200/50 flex w-fit items-center justify-center rounded-full p-4">
                      <FaLinkedin className="text-3xl text-green-400" />
                    </Link>
                    <Link href="/" className="bg-base-200 hover:bg-base-200/50 flex w-fit items-center justify-center rounded-full p-4">
                      <IoEarthOutline className="text-3xl text-green-400" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-base-100 mt-10 rounded-md p-5">
                <h4>Project Budget</h4>
                <p className="pb-3 text-gray-400 uppercase">#{data?._id?.slice(-4)}</p>

                <div className="border-dark-2 space-y-3 rounded-md border-r border-b border-l">
                  <div className="bg-base-200 grid grid-cols-4 rounded-t-md px-5 py-2">
                    <p className="col-span-2 capitalize">Service</p>
                    <p className="capitalize">Duration</p>
                    <p className="capitalize">Amount</p>
                  </div>
                  {data?.budget?.map((item: any, index: any) => (
                    <div className="grid grid-cols-3 rounded-sm px-5 py-2" key={index}>
                      <p className="col-span-2 capitalize">{item.description}</p>
                      <p className="capitalize">{item.duration}</p>
                      <p className="capitalize">{item.amount}</p>
                    </div>
                  ))}

                  {/* Total amount calculation */}
                  <div className="border-t-dark-2 grid grid-cols-5 rounded-sm border-t px-5 py-2">
                    <p className="col-span-2 font-semibold capitalize">Total Amount</p>
                    <p></p>
                    <p className="font-semibold capitalize">
                      ${data?.budget?.reduce((acc: number, item: any) => acc + (item.amount || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="border-dark-2 mt-5 flex items-center gap-2 rounded-md border p-5">
                  <div className="w-fit">
                    <GoInfo className="text-primary" />
                  </div>
                  <p>Note: Contact us and provide project #id for development of this project</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default ProjectDetails;
