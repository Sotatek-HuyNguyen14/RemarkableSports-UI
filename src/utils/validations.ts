const isNotEmpty = (str: string) => {
  return !(!str || str.length === 0);
};

const isValidEmail = (str: string) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
};

const isValidMobileNumber = (str: string) => {
  return /^1[0-9]{10}$|^[569][0-9]{7}$/.test(str);
};

const isValidPassword = (str: string) => {
  // at least 1 Uppercase, 1 Lowercase, 1 number, at least 8 characters

  return /^\S*(?=\S{8,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])\S*$/.test(str);
};

export { isValidEmail, isValidMobileNumber, isNotEmpty, isValidPassword };
