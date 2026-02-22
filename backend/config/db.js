const mongoose = require('mongoose');
const connectdb = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI); //use mongodb from env to connect
        console.log(`mongodb connect`);
    }
    catch (error){
        console.log(`failed`,error.message);
        process.exit(1);
    }
}
module.exports = connectdb;