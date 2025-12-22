"use client";
import { ReactNode, useState } from "react";
import { IoFilter } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

const SideDrawerFilter = ({ children, button }: { children: ReactNode; button: any }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const drawerButton = () => (
    <div className="relative" onClick={handleToggle}>
      {button}
    </div>
  );

  return (
    <div className="">
      {/* Button for toggle drawer */}
      {drawerButton()}

      {/* Backdrop Layer */}
      {open && <div className="fixed top-0 left-0 z-40 h-screen w-screen bg-black/70" onClick={handleToggle}></div>}

      {/* Drawer */}
      <div
        className={`bg-base-100 fixed top-0 left-0 z-[999] h-screen w-[300px] overflow-y-scroll px-7 py-14 ${
          open ? "translate-x-[0%]" : "-translate-x-[100%]"
        } transition-all duration-1000 ease-in-out`}
      >
        <RxCross2 className="absolute top-5 right-3 cursor-pointer text-[22px]" onClick={handleToggle} />

        {/* Drawer Content */}
        {children}
      </div>
    </div>
  );
};

export default SideDrawerFilter;
