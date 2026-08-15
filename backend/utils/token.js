import  jwt  from "jsonwebtoken"

const genToken= async (id)=>{
    try{

        const token = await jwt.sign({id},process.env.JWT_SECRET_KEY,{expiresIn:'7d'})
        return token

    }catch(error){
        console.log("error while generating token : ",error)
    }
}

export default genToken;