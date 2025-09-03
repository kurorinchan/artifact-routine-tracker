import React, { useState, useEffect } from 'react';

// A simple utility to get a contrasting color (black or white) for better readability.
const getContrastColor = (hexColor) => {
  // Convert hex to RGB.
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Calculate luminance.
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors.
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const App = () => {
  // State to manage routines, colors, theme, and UI elements.
  const [routines, setRoutines] = useState({});
  const [mainColor, setMainColor] = useState('#EF4444');
  const [subColor, setSubColor] = useState('#22C55E');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showClearModal, setShowClearModal] = useState(false);
  const [theme, setTheme] = useState('light');

  // Helper to format the date as 'YYYY-MM-DD' for use as a key.
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to format a time string in HH:MM:SS format.
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  // Load data and theme from localStorage on initial component mount.
  useEffect(() => {
    try {
      const storedRoutines = localStorage.getItem('routines');
      const storedMainColor = localStorage.getItem('mainColor');
      const storedSubColor = localStorage.getItem('subColor');
      const storedTheme = localStorage.getItem('theme');

      if (storedRoutines) {
        setRoutines(JSON.parse(storedRoutines));
      }
      if (storedMainColor) {
        setMainColor(storedMainColor);
      }
      if (storedSubColor) {
        setSubColor(storedSubColor);
      }
      if (storedTheme) {
        setTheme(storedTheme);
      }
    } catch (e) {
      console.error("Could not load data from localStorage.", e);
    }
  }, []);

  // Save data to localStorage whenever the state changes.
  useEffect(() => {
    try {
      localStorage.setItem('routines', JSON.stringify(routines));
    } catch (e) {
      console.error("Could not save routines to localStorage.", e);
    }
  }, [routines]);

  useEffect(() => {
    try {
      localStorage.setItem('mainColor', mainColor);
    } catch (e) {
      console.error("Could not save main color to localStorage.", e);
    }
  }, [mainColor]);

  useEffect(() => {
    try {
      localStorage.setItem('subColor', subColor);
    } catch (e) {
      console.error("Could not save sub color to localStorage.", e);
    }
  }, [subColor]);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.className = theme;
    } catch (e) {
      console.error("Could not save theme to localStorage.", e);
    }
  }, [theme]);

  // Handle a user recording a routine for the current day.
  const handleRecordRoutine = (type) => {
    const todayKey = formatDate(new Date());
    const timestamp = new Date().toISOString();
    setRoutines(prevRoutines => ({
      ...prevRoutines,
      [todayKey]: { type, timestamp },
    }));
  };

  // Open the modal to confirm data deletion.
  const handleClearData = () => {
    setShowClearModal(true);
  };

  // Confirmed data deletion, clear all local storage data.
  const confirmClearData = () => {
    localStorage.clear();
    setRoutines({});
    setMainColor('#EF4444');
    setSubColor('#22C55E');
    setTheme('light');
    setShowClearModal(false);
  };

  // Cancel data deletion.
  const cancelClearData = () => {
    setShowClearModal(false);
  };

  // Toggle between light and dark themes.
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Helper to get the days in a month.
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Helper to get the day of the week for the first day of the month.
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Helper to navigate the calendar.
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  // Generate the calendar grid for a given month.
  const renderCalendar = (dateToRender, isSmall = false) => {
    const year = dateToRender.getFullYear();
    const month = dateToRender.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const todayKey = formatDate(new Date());

    const calendarDays = [];

    // Add empty placeholders for days before the 1st.
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add days of the month.
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateKey = formatDate(date);
      const routineEntry = routines[dateKey];
      const routineType = routineEntry ? routineEntry.type : null;
      const routineTime = routineEntry ? formatTime(routineEntry.timestamp) : null;

      let bgColor = 'bg-white dark:bg-gray-800';
      let textColor = theme === 'dark' ? '#E5E7EB' : '#1F2937'; // Default text color

      if (routineType === 'main') {
        bgColor = `bg-[${mainColor}]`;
        textColor = getContrastColor(mainColor);
      } else if (routineType === 'sub') {
        bgColor = `bg-[${subColor}]`;
        textColor = getContrastColor(subColor);
      }

      const isToday = todayKey === dateKey;
      const todayClass = isToday ? 'border-2 border-indigo-500 font-bold' : '';

      const baseClasses = `relative text-center rounded-lg transition-colors ${bgColor} ${todayClass} cursor-default flex flex-col items-center justify-center`;
      const sizeClasses = isSmall ? 'p-1 min-h-[3rem] text-sm' : 'p-2 min-h-[5rem] sm:min-h-[6rem] text-xl';

      calendarDays.push(
        <div
          key={`day-${i}`}
          className={`${baseClasses} ${sizeClasses}`}
        >
          <div style={{ color: textColor }} className={`${isSmall ? 'text-xs' : 'text-xl'}`}>{i}</div>
          {routineTime && !isSmall && <div style={{ color: textColor }} className="text-xs mt-1 font-semibold">{routineTime}</div>}
        </div>
      );
    }
    return calendarDays;
  };

  // Calculate the previous month's date.
  const previousMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

  return (
    <div className={`min-h-screen font-sans transition-colors ${theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <div className="flex justify-end p-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full transition-colors bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex justify-center items-center p-4">
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-2xl transition-colors`}>

          {/* Header */}
          <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-900 dark:text-gray-100">
            Routine Tracker
          </h1>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <button
              onClick={() => handleRecordRoutine('main')}
              className="w-full sm:w-1/2 py-3 px-6 rounded-full text-white font-semibold transition-transform transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: mainColor }}
            >
              Record Main Routine
            </button>
            <button
              onClick={() => handleRecordRoutine('sub')}
              className="w-full sm:w-1/2 py-3 px-6 rounded-full text-white font-semibold transition-transform transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: subColor }}
            >
              Record Sub Routine
            </button>
          </div>

          {/* Color Pickers */}
          <div className="flex justify-center items-center space-x-6 mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Main:</span>
              <input
                type="color"
                value={mainColor}
                onChange={(e) => setMainColor(e.target.value)}
                className="w-8 h-8 rounded-full border-none cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sub:</span>
              <input
                type="color"
                value={subColor}
                onChange={(e) => setSubColor(e.target.value)}
                className="w-8 h-8 rounded-full border-none cursor-pointer"
              />
            </div>
          </div>

          {/* Main Calendar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`}
              </h2>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar(currentDate)}
            </div>
          </div>

          {/* Previous Month Records */}
          <div className="mt-8">
            <h3 className="text-lg font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
              {`${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}`} Records
            </h3>
            <div className="grid grid-cols-7 text-center font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar(previousMonthDate, true)}
            </div>
          </div>

          {/* Clear Data Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleClearData}
              className="py-2 px-6 rounded-full text-sm font-semibold text-red-600 border border-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400 dark:border-red-400"
            >
              Clear All Data
            </button>
          </div>

          {/* Confirmation Modal */}
          {showClearModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl text-center max-w-sm w-full transition-colors">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Deletion</h3>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete all routine data? This action cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={confirmClearData}
                    className="py-2 px-6 rounded-full bg-red-500 text-white font-semibold transition-transform transform hover:scale-105"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={cancelClearData}
                    className="py-2 px-6 rounded-full bg-gray-300 text-gray-800 font-semibold transition-transform transform hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;