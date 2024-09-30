FROM denoland/deno:alpine-latest

# Copy your Deno project
COPY . .

# Set the entrypoint to run your Deno script
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "main.ts"] 