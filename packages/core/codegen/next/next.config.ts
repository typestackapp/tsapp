import { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: { }, // Required for next 13
    distDir: ".next",
    basePath: undefined,
    reactStrictMode: true, // Recommended for the pages directory, default in app.
    swcMinify: true,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {

        // follow symlink
        // config.resolve.symlinks = true

        // // hash all files
        config.watchOptions = {
            //followSymlinks: true,
            aggregateTimeout: 200,
            poll: 1000,
        }

        // config.cache = false

        // config.devServer = {
        //     hot: true
        // }

        // use bable to transpile typescript
        config.module.rules.push({
            test: /.(ts|tsx)$/,
            exclude: /node_modules/,
            use: [{
                loader: "babel-loader",
                options: {
                    presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
                }
            }],
        })
        return config
    },
    async rewrites() {
        return []
    }
}

module.exports = nextConfig