FROM node:14.15.0

# Expose environment variable PORT=3000
ENV PORT 3000

# Create app directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Bundle app source source code
COPY . /usr/src/app

# Build the app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["npm","start"]
