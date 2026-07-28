import { useEffect } from 'react';

/**
 * Locks body scroll when isLocked is true.
 * Automatically restores scroll on unmount.
 */
const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLocked]);
};

export default useScrollLock;
