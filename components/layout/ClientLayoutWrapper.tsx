'use client';

import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import Sidebar, { HistoryEntry } from "./Sidebar";
import GlobalBackground from "@/components/ui/GlobalBackground";
import { AnimatePresence, motion } from "framer-motion";

interface ClientLayoutWrapperProps {
  children: ReactNode;
  userEmail: string | null;
  nickname: string;
  history: HistoryEntry[];
}

export default function ClientLayoutWrapper({
  children,
  userEmail,
  nickname,
  history,
}: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const isLandingPage = pathname === "/";
  const showSidebar = userEmail && !isLandingPage;

  return (
    <>
      <GlobalBackground />
      
      {showSidebar && (
        <Sidebar 
          email={userEmail ?? ""} 
          nickname={nickname} 
          history={history} 
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}
      
      <div 
        className={`relative z-10 flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          showSidebar ? (isSidebarCollapsed ? "md:ml-20" : "md:ml-64") : "ml-0"
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname} // triggers animation on route change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
