// Import the Mongoose library
import mongoose from 'mongoose';

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    // Define the name field with type String and required property set to true
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },

    // Define the phone number field with type String and required property set to true
    phoneNumber: { type: String, required: true },

    // Define the email field with type String, required set to true, and unique set to true
    email: { type: String, required: true, unique: true },

    // Define the password field with type String and required set to true
    password: { type: String, required: true },

    // Define the isAdmin field with type Boolean, default set to false, and required set to true
    isAdmin: { type: Boolean, default: false, required: true },
  },
  {
    // Enable timestamps for the schema
    timestamps: true,
  }
);

// Create the User model based on the schema
const User = mongoose.model('User', userSchema);

// Export the User model for use in other parts of the application
export default User;
