FROM denoland/deno:alpine-1.46.3

# Copy your Deno project
COPY . .

# Set the entrypoint to run your Deno script
CMD ["deno", "run", "--allow-net", "--allow-read", "--allow-write", "--allow-env", "main.ts"] 