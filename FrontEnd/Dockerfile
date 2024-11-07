# Use the official Node.js image
FROM node:18 AS build
WORKDIR /FrontEnd

# Install dependencies
COPY FrontEnd/package*.json ./
RUN npm install

# Copy the rest of the application code
COPY FrontEnd/. .

# Build the Angular application
RUN npm run build --prod

# Use Nginx to serve the application
FROM nginx:alpine
COPY --from=build /FrontEnd/dist/frontend.client /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
