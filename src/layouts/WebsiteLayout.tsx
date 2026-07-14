import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/common/Footer";
import { Cursor } from "../components/common/Cursor";
import AppCanvas from "./AppCanvas";

export const WebsiteLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-text-primary flex flex-col relative overflow-x-hidden w-full max-w-full">
      {/* Paper Texture Overlay */}
      <div className="paper-texture" />

      {/* Global Custom Cursor */}
      <Cursor />

      {/* Navigation */}
      <Navbar />

      {/* Floating Editorial Content Canvas */}
      <AppCanvas>
        {/* Main Content Area */}
        <main className="flex-grow">
          <Outlet />
        </main>

        {/* Footer inside canvas */}
        <Footer />
      </AppCanvas>
    </div>
  );
};
