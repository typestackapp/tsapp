import { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        serverActions: {
            bodySizeLimit: '100mb',
        },
    },
    distDir: ".next",
    basePath: undefined,
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
        config.watchOptions = {
            //followSymlinks: true,
            aggregateTimeout: 200,
            poll: 1000,
        }
        return config
    },
    async rewrites() {
        return []
    }
}

module.exports = nextConfig