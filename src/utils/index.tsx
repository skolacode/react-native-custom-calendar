export const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) ) + min;

/*
-1 as array index starts from 0
*/
const WEEK_INDEX_OFFSET = 1;

export const getCurrentWeekIndex = (currentDate: Date) => {
  return Math.ceil((currentDate.getDate() - currentDate.getDay() - WEEK_INDEX_OFFSET) / 7);
};

export const getLastWeekIndex = (month: number, year: number) => {
  const currentDate = new Date(year, month, -1);
  return Math.ceil((currentDate.getDate() - currentDate.getDay() - WEEK_INDEX_OFFSET) / 7);
};
