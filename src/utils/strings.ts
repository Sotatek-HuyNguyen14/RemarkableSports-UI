/* eslint-disable import/prefer-default-export */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function insertSpaces(s) {
  return s.replace(/([A-Z])/g, " $1").trim();
}

function twoDigitsFormat(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function createRandomString(amount: number) {
  const chars = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];
  let nums = "";
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < amount; i++) {
    const id = parseInt((Math.random() * 61).toString(), 10);
    nums += chars[id];
  }
  return nums;
}

function isPositiveNumber(num: string) {
  const regPos = /^\d+$/;
  if (regPos.test(num)) {
    return true;
  }
  return false;
}

function isBlank(str?: string) {
  return !str || /^\s*$/.test(str) || str === "";
}

function isYoutube(str?: string) {
  if (!str?.trim()) return false;
  const regPos =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
  return regPos.test(str.trim());
}

function getYoutubeId(value?: string) {
  if (!value?.trim()) return false;

  const regEx =
    "^(?:https?:)?//[^/]*(?:youtube(?:-nocookie)?.com|youtu.be).*[=/]([-\\w]{11})(?:\\?|=|&|$)";

  const matches = value.match(regEx);
  if (matches && matches.length > 0) {
    return matches[1];
  }
  return false;
}

export {
  capitalizeFirstLetter,
  insertSpaces,
  twoDigitsFormat,
  createRandomString,
  isPositiveNumber,
  isBlank,
  isYoutube,
  getYoutubeId,
};
