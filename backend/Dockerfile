<<<<<<< HEAD
FROM node:18
=======
# Use Node 20 as base image
FROM node:20
>>>>>>> f840efe902ab0c719b5353e1158d77e6f010305f

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

<<<<<<< HEAD
=======
# Install dependencies
>>>>>>> f840efe902ab0c719b5353e1158d77e6f010305f
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your backend runs on
EXPOSE 5000

<<<<<<< HEAD
CMD ["npm", "start"]
=======
# Start the server using node
CMD ["node", "src/server.js"]
>>>>>>> f840efe902ab0c719b5353e1158d77e6f010305f
