import { useEffect, useState } from 'react';
import { useAuth } from '../Auth/authContext';

const useActivity = () => {
  const [activityCount, setActivityCount] = useState(0);
  const { currentUser } = useAuth();

  const DEFAULT_ACTIVITY_EVENTS = [
    'keydown',
    'DOMMouseScroll',
    'mousewheel',
    'mousedown',
    'touchstart',
    'touchmove',
  ];

  const MAX_ACTIVITY_COUNT = 3;

  const increaseActivityCount = () => {
    setActivityCount(activityCount + 1);
  };

  const attachListeners = () => {
    DEFAULT_ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, increaseActivityCount, false);
    });
  };

  const detachListeners = () => {
    DEFAULT_ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, increaseActivityCount, false);
    });
  };

  useEffect(() => {
    !currentUser && attachListeners();
    if (!currentUser && activityCount >= MAX_ACTIVITY_COUNT) {
      detachListeners();
      return;
    }
    if (currentUser && activityCount >= MAX_ACTIVITY_COUNT) {
      setActivityCount(0);
      detachListeners();
      return;
    }
    return detachListeners;
  }, [activityCount, currentUser]);

  return { activityCount, setActivityCount };
};

export default useActivity;
