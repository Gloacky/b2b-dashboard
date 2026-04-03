import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental:{
    serverActions:{
      allowedOrigins:["localhost:3000"]
    }
  }
};



const originalError = console.error
console.error = (...args) => {
  if (
    /Invalid DOM property `(stroke-linejoin|fill-rule|clip-rule)`/.test(args[0])
  ) {
    return
  }
  originalError.call(console, ...args)
}

export default nextConfig;