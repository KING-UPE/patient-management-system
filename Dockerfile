# Stage 1: Dependency Installation
FROM node:18-alpine AS dependency-builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies. Back4app environments are production
# Back4app typically doesn't need dev dependencies.
RUN npm install --production

# ---

# Stage 2: Final Production Image
FROM node:18-alpine AS final

# Set the working directory
WORKDIR /usr/src/app

# Copy only the installed dependencies from the builder stage
COPY --from=dependency-builder /usr/src/app/node_modules ./node_modules

# Copy the rest of the application source code
# This copies all folders (client, server, etc.)
COPY . .

# Expose the default Express port (3000), although Back4app will use the dynamic PORT env variable.
EXPOSE 3000

# Run the start script defined in your package.json.
# This is the required entry point for most Node.js deployment platforms.
CMD [ "npm", "start" ]
