console.log("Checking for API Key...");
if (process.env.OPENAI_API_KEY) {
  console.log("API Key found!");
  console.log("Key Prefix: ", process.env.OPENAI_API_KEY.substring(0, 10));
} else {
  console.log("Error: API Key is not found!");
}