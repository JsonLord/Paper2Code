FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm i --no-frozen-lockfile --ignore-scripts

# Build
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=base /app/public ./public
RUN mkdir -p .next && chown node:node .next
COPY --from=base --chown=node:node /app/.next/standalone ./
COPY --from=base --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 7860
ENV PORT 7860
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
