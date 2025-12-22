"use client";
import NextTopLoader from "nextjs-toploader";
import { useState } from "react";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
      {children}
    </>
  );
}
