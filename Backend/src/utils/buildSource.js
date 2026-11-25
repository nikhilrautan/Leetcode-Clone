// Joins the user's code into the hidden driver for that language.
// If a problem has no driver yet (old stdin-style problem), the user's code is run as-is.
const buildSource = (driverCode, language, userCode) => {
  const driver = driverCode?.find(
    (d) => d.language?.toLowerCase() === language?.toLowerCase()
  );
  if (!driver) return userCode;
  return driver.code.replace('{{USER_CODE}}', () => userCode);
};

module.exports = buildSource;