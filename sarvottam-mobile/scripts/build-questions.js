const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(__dirname, '../../paper/neet_questions.json');
const destPath = path.resolve(__dirname, '../src/data/questionsNeetBotany.ts');

const qs = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
const content = `import { CbtQuestion } from '../types';\n\nexport const NEET_BOTANY_QUESTIONS: CbtQuestion[] = ${JSON.stringify(qs, null, 2)};\n`;

fs.mkdirSync(path.dirname(destPath), { recursive: true });
fs.writeFileSync(destPath, content, 'utf8');
console.log('Successfully generated questionsNeetBotany.ts with', qs.length, 'questions');
