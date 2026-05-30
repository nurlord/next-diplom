const { beginCell } = require("@ton/core");
const cell = beginCell().storeUint(0, 32).endCell();
const hash = cell.hash();
console.log("Type:", hash.constructor.name);
console.log("toString:", hash.toString("hex"));
try {
  console.log("Buffer.from:", Buffer.from(hash).toString("hex"));
} catch (e) {}
