FROM node:24-alpine AS base
WORKDIR /workspace
ENV NODE_ENV=production

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install

FROM deps AS build
COPY . .
RUN npm run typecheck

FROM base AS runtime
WORKDIR /workspace
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=build /workspace .
EXPOSE 3000
CMD ["npm", "run", "dev", "--workspace=@mightbehuman/api"]
