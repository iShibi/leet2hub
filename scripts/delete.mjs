#!/usr/bin/env zx

import fs from 'fs';
import path from 'path';

const distDir = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distDir)) {
	fs.rmSync(distDir, { recursive: true, force: true });
	console.log(`Deleted 'dist' directory and its contents`);
} else {
	console.log(`'dist' directory does not exist.`);
}
