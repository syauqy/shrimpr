import * as React from "react";
import { Inter } from "@next/font/google";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"] });
export const PageLayout = ({ children }) => {
  return (
    <section
      className={clsx(
        "flex flex-col flex-1 min-h-screen scroll-smooth overflow-hidden bg-gray-100 ",
        inter.className
      )}
    >
      {children}
    </section>
  );
};
