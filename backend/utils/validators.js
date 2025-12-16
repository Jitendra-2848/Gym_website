const Member = require("../model/Member");
const bcrypt = require('bcrypt');
const validation = async (mobile,id, hash) => {
  const member = await Member.findById(id);
  const mobileStr = String(mobile);
  const idStr = String(id);
  const pickIndexes = [0, 2, 4, 6];
  const mobilePart = pickIndexes.map(i => mobileStr[i] ?? '').join('');
  const idPart = pickIndexes.map(i => idStr[i] ?? '').join('');
  const combinedValue = mobilePart + idPart;
  // const salt = await bcrypt.genSalt(10);
  // const hash = await bcrypt.hash(combinedValue, salt);
  const check = await bcrypt.compare(combinedValue,hash);
};

module.exports = { validation }