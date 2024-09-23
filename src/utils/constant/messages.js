
const generateMessage = (entity) => ({
  alreadyExist: `${entity} already exist`,
  notFound: `${entity} not found`,
  failToCreate: `fail to create ${entity} `,
  failToUpdate: `fail to update ${entity} `,
  createSuccessfully: `create ${entity} Successfully`,
  updateSuccessfully: `update ${entity} Successfully`,
  deleteSuccessfully: `delete ${entity} Successfully`,
});
export const messages = {
  category: generateMessage("category"),
  subcategory: generateMessage("subcategory"),
  brand: generateMessage("brand"),
  product:generateMessage("product"),
  user:generateMessage("user"),
  review:generateMessage("review"),
  coupon:generateMessage("coupon"),
  file:{required:'file is required '},
  user: {
    ...generateMessage('user'),
    verified: "user verified successfully",
    invalidCredntiols: "invalid Credntiols",
    notVerified: "not Verified",
    loginSuccessfully: "login successfully",
  }
};
