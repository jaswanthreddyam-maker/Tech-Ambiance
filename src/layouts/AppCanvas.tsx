import React from "react";

interface AppCanvasProps {
  children: React.ReactNode;
}

const AppCanvas: React.FC<AppCanvasProps> = ({ children }) => {
  return (
    <div className="mx-auto my-3 sm:my-4 md:my-6 lg:my-8 w-[calc(100%-20px)] sm:w-[calc(100%-32px)] md:w-[calc(100%-48px)] lg:w-[calc(100%-96px)] max-w-[1600px] rounded-[24px] sm:rounded-[32px] bg-[#FCFBF8] relative border border-border-custom/30 flex flex-col overflow-hidden">
      {children}
    </div>
  );
};

export default AppCanvas;

