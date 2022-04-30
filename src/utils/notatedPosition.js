import { rowLetters } from "../constants/rows";

export const getNotatedPosition = ([row, column]) => {
  return rowLetters[column] + (8 - row);
};

export const getCoordenatePositions = (position) => {
  const arrayPosition = [];

  const letter = position.charAt(0);
  const number = position.charAt(1);

  arrayPosition[1] = rowLetters.indexOf(letter);
  arrayPosition[0] = 8 - parseInt(number);

  return arrayPosition;
};
