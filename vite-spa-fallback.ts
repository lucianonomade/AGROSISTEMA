import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export function spaFallbackPlugin(): Plugin {
    return {
        name: 'spa-fallback',
        configurePreviewServer(server) {
            server.middlewares.use((req, res, next) => {
                const url = req.url || '';

                // Skip if it's an API call
                if (url.startsWith('/api')) {
                    return next();
                }

                // Skip if it has a file extension (static assets)
                const ext = path.extname(url.split('?')[0]);
                if (ext && ext !== '.html') {
                    return next();
                }

                // Skip common asset paths
                if (url.startsWith('/assets/') ||
                    url.startsWith('/public/') ||
                    url.startsWith('/@') ||
                    url.includes('.')) {
                    return next();
                }

                // For HTML routes without extension, serve index.html
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
