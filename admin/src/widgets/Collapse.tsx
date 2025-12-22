"use client";
import { useState, ReactNode } from "react";

interface CollapseProps {
  title: string;
  children: ReactNode;
}

const Collapse = ({ title, children }: CollapseProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <div className={`bg-base-100 collapse-arrow collapse rounded-md ${isCollapsed ? "collapse-open" : "collapse-close"}`}>
        <div className="collapse-title flex items-center justify-between text-xl font-medium" onClick={handleCollapse}>
          {<span className="text-base font-semibold">{title}</span>}
        </div>
        <div className="collapse-content">
          <div>
            <ul className="space-y-3">{children}</ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Collapse;
