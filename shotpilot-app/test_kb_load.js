import { readKBFile } from './server/services/kbLoader.js';

try {
    const content = readKBFile('models/kling-3.0.md');
    if (content) {
        console.log('File loaded successfully!');
        console.log('First 200 chars:', content.substring(0, 200));
        console.log('File length:', content.length, 'characters');
    } else {
        console.error('Failed to load file.');
    }
} catch (error) {
    console.error('Error:', error);
}
