import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegDotCircle } from "react-icons/fa";

const SidebarDropdown = ({ item, isItemActive }: any) => {
  const pathname = usePathname();

  return (
    <>
      <ul className="mt-3 mb-3 flex flex-col gap-1.5 pl-6">
        {item.map((item: any, index: number) => (
          <li key={index}>
            <Link
              href={item.route}
              className={`group hover:bg-base-200/60 relative flex items-center gap-2.5 rounded-md px-4 py-2 font-medium duration-300 ease-in-out ${
                pathname === item.route ? "bg-base-200/60" : ""
              }`}
            >
              <FaRegDotCircle />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default SidebarDropdown;
