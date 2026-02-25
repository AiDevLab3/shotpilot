import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: ['tests/phase3.test.js'],
        testTimeout: 30000,
        hookTimeout: 30000,
        pool: 'forks',        // Isolate tests to avoid DB conflicts
        fileParallelism: false, // Run test files sequentially
        env: {
            NODE_ENV: 'test',
        },
    },
});
