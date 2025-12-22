"use client";
import { Helper } from "@/utils/Helper";
import moment from "moment";
import React from "react";
import { GiHouseKeys } from "react-icons/gi";
import { useSelector } from "react-redux";

const UserDetails = () => {
  const { user } = useSelector((state: any) => state.user);

  return (
    <div>
      <h6 className="mb-2">#{user?._id}</h6>

      <div className="bg-base-100 grid w-[50%] grid-cols-2 rounded-md p-5 shadow-lg">
        <div className="space-y-3">
          <p>Name: </p>
          <p>Phone: </p>
          <p>Role: </p>
          <p>Shop Type: </p>
          <p>IS Premium: </p>
          <p>IS Blocked: </p>
          <p>Premium Expiry: </p>
          <p>Created At: </p>
          <p>Updated At: </p>
        </div>

        <div className="space-y-3">
          <p className="capitalize">{user?.name}</p>
          <p>(+92) {user?.phone}</p>
          <p
            className={`badge ${user.role === "user" ? "badge-primary bg-primary/20 text-primary border-primary/50" : "badge-error bg-error/20 text-error border-error/50"}`}
          >
            {user.role}
          </p>

          <div>
            <span className={"badge badge-info bg-info/20 text-info border-info/50"}>{user?.shopType?.type}</span>
          </div>

          <div>
            {(() => {
              const daysLeft = Helper.getDaysLeft(user.premiumExpiry);

              if (!user.isPremium || !user.premiumExpiry) {
                return <p className="badge badge-error bg-error/20 text-error border-error/50">Not Premium</p>;
              }

              return (
                <p
                  className={`badge ${
                    daysLeft <= 0
                      ? "badge-error bg-error/20 text-error border-error/50"
                      : "badge-success bg-success/20 text-success border-success/50"
                  }`}
                >
                  {daysLeft <= 0 ? "Expired" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining`}
                </p>
              );
            })()}
          </div>

          <div>
            <span className={user?.isBlocked ? "badge badge-error" : "badge badge-success bg-success/20 text-success border-success/50"}>{user?.isBlocked ? "Yes" : "No"}</span>
          </div>

          <div>{moment(user?.premiumExpiry).format("DD MMM, YYYY")}</div>
          <div>{moment(user?.createdAt).format("DD MMM, YYYY")}</div>
          <div>{moment(user?.updatedAt).format("DD MMM, YYYY")}</div>

          <p>{user?.projects?.length}</p>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
