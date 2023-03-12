// Define a function called getErrorMessage that takes an error object as input
export function getErrorMessage(error) {
  // If the error object has a response property and a data property with a message property,
  // return the message property
  if (error.response && error.response.data.message) {
    return error.response.data.message;
  } else {
    // Otherwise, return the error message property
    return error.message;
  }
}
