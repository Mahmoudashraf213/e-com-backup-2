export const resetPassword = async (req,res,next) => {
  // get data from req
  const {oldPassword,newPassword} = req.body
  const userId = req.authUser._id
  // check user password 
  
}