// useResponsive.js
import { useEffect, useState } from "react";

export default function useResponsive() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);
  const [isTablet, setIsTablet] = useState(window.innerWidth > 600 && window.innerWidth <= 900);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
      setIsTablet(window.innerWidth > 600 && window.innerWidth <= 900);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile, isTablet };
}
