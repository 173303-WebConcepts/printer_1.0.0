"use client";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/Sidebar";
import NextTopLoader from "nextjs-toploader";
import { useState } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <NextTopLoader
        color="#EDAE49"
        // initialPosition={0.08}
        crawlSpeed={200}
        height={4}
        crawl={true}
        showSpinner={true}
        easing="ease-out"
        speed={600}
        zIndex={1600}
        showAtBottom={false}
      />
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="xl:flex">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col lg:ml-72">
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
