FROM oven/bun:latest
EXPOSE 3000

WORKDIR /app
COPY index.ts ./index.ts
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
RUN bun install
CMD [ "bun", "run", "index.ts" ]