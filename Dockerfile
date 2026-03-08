FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install
#COPY .(1) means copy all the project(cuz we are in the root) .(2) paste inside the /app folder in the container
COPY . .   
#right side (for container)
EXPOSE 3000 

CMD [ "npm", "run", "start" ]