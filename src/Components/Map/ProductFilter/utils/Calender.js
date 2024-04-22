import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useColor } from '../../../../CustomContext/ColorContext';

const Calendar = ({ selectedDate, dynamicDates, handleCalendarChange }) => {
  const { backgroundColor, textColor, borderColor } = useColor();
  const today = new Date();
  // Calculate the date 10 days from today
  const tenDaysFromNow = new Date(today);
  tenDaysFromNow.setDate(today.getDate() + 10);
  
  return (
    <div>
      <DatePicker
        onChange={handleCalendarChange}
        value={selectedDate}
        minDate={today}
        maxDate={tenDaysFromNow}
        highlightDates={dynamicDates}
        open
        dateFormat="yyyy-MM-dd'T'HH:mm:ss'Z'"
        style={{
          backgroundColor,
          color: textColor,
          borderColor,
        }}
      />
    </div>
  );
};

export default Calendar;