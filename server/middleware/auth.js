const clerkClinet = require("@clerk/express")

const protectAdmin = async (req,res , next)=>{

  try{

    const {userId} = req.auth();
    const user = await clerkClinet.users.getUser(userId)

    if(user.privateMetadata.role !== 'admin'){
      return res.json({success:false, message:"not Authorized"})
    }

    next();

  }catch(error){

    return res.json({success:false, message:"not Authorized"})

  }

}

module.exports=protectAdmin;