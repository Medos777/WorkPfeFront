# Step 1: Build the React app using a Node.js container
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Set environment variables
ENV REACT_APP_API_URL=http://localhost:3001
ENV REACT_APP_SOCKET_URL=http://localhost:3001

# Build the React app
RUN npm run build

# Step 2: Use an Nginx container to serve the built files
FROM nginx:alpine

# Copy the built files from the previous stage to the Nginx html directory
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to allow access to the application
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
