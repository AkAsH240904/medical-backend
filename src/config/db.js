import mongoose from "mongoose";

const connectDb =async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`mongodb+srv://akashlohani2004:akashscheduler@scheduler.br33wjl.mongodb.net/?appName=scheduler/Schedular`);
        console.log(`DB connected sucessfully! DB Host: ${connectionInstance.connection.host}`)
    }catch(err){
        console.log("MONGODB connection error",err);
        process.exit(1);
    }
}

export default connectDb;