import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function spaFallbackPlugin(): Plugin {
    return {
        name: 'spa-fallback',
        configurePreviewServer(server) {
            server.middlewares.use((req, res, next) => {
                // Skip if it's an API call or file with extension
                if (req.url?.startsWith('/api') || path.extname(req.url || '') !== '') {
                    return next();
                }

                // For all other routes, serve index.html
                const indexPath = path.resolve(server.config.root, 'dist', 'index.html');
                if (fs.existsSync(indexPath)) {
                    res.setHeader('Content-Type', 'text/html');
                    fs.createReadStream(indexPath).pipe(res);
                } else {
                    next();
                }
            });
        },
    };
}
