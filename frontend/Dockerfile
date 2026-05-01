FROM node:22-alpine

WORKDIR /app

COPY package.json tsconfig.json next.config.ts postcss.config.js tailwind.config.ts components.json /app/
COPY app /app/app
COPY components /app/components
COPY hooks /app/hooks
COPY lib /app/lib
COPY public /app/public
COPY store /app/store
COPY styles /app/styles
COPY types /app/types
COPY .env.example /app/.env.example

RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

