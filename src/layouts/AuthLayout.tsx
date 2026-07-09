import React from "react";
import { Outlet } from "react-router-dom";
import { Cursor } from "../components/common/Cursor";

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-screen bg-[#FAF7F0] text-text-primary overflow-x-hidden relative flex flex-col select-none">
      {/* Custom Cursor */}
      <Cursor />

      {/* Content wrapper */}
      <main className="flex-grow flex w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
