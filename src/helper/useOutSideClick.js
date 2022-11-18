import { useState, useEffect, useRef } from "react";

export default function useOutSideClick() {
  const [isComponentVisible, setIsComponentVisible] = useState(false);
  const clickedRef = useRef(null);

  const handleClickOutside = (event) => {
    if (clickedRef.current && !clickedRef.current.contains(event.target)) {
      isComponentVisible && setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, !isComponentVisible);

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside,
        !isComponentVisible
      );
    };
  });

  return { clickedRef, isComponentVisible, setIsComponentVisible };
}
