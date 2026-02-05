const userData = new Map();

function ensureUserStore(userId) {
  if (!userData.has(userId)) {
    userData.set(userId, {
      calendar: {},
      pantry: []
    });
  }
  return userData.get(userId);
}

function getCalendar(userId) {
  return ensureUserStore(userId).calendar;
}

function setCalendar(userId, calendar) {
  ensureUserStore(userId).calendar = calendar;
  return ensureUserStore(userId).calendar;
}

function getPantry(userId) {
  return ensureUserStore(userId).pantry;
}

function setPantry(userId, pantry) {
  ensureUserStore(userId).pantry = pantry;
  return ensureUserStore(userId).pantry;
}

module.exports = {
  getCalendar,
  setCalendar,
  getPantry,
  setPantry
};
