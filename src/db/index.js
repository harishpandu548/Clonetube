import mongoose from "mongoose";

import { DB_NAME } from "../constant.js";

const dbConnection= async () =>{
    try{
        const connectionIntstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`Db connection success and the output is ${connectionIntstance}`)
        console.log(`Db connection success and the output is ${connectionIntstance.connection.host}`)
    }
    catch(error){
        console.log("Error at connection to db",error)
    }

}

export default dbConnection;