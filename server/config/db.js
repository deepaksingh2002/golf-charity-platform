import mongoose from "mongoose";


// Establishes a single MongoDB connection before the HTTP server starts.
const connectDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.MONGO_CONNECTION_STRING}/${process.env.MONGO_DB_NAME}`)
        console.log(`MongoDB connected!! DB_HOST: ${connectInstance.connection.host}`);
    } catch (error) {
        console.log("Mongose connection error: ", error);
        process.exit(1);
    }
}


export default connectDB
