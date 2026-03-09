/** @type {import('next').NextConfig} */
const nextConfig = {
  // API-only; frontend remains on Vite. Transpile shared src for API route imports.
  transpilePackages: [],
}

export default nextConfig
