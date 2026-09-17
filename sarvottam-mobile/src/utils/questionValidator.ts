import { CbtQuestion } from '../types';

export interface OptionValidationResult {
  isValid: boolean;
  issues: string[];
}

export interface DatasetValidationSummary {
  total: number;
  validCount: number;
  flaggedCount: number;
  flagged: Array<{
    id: number;
    subject: string;
    section: string;
    questionSnippet: string;
    issues: string[];
    options: Record<string, string>;
  }>;
}

/**
 * Validates that a question has exactly 4 distinct, non-empty options ('a', 'b', 'c', 'd').
 * Flags any duplicate, missing, empty, or placeholder options.
 */
export function validateQuestionOptions(q: CbtQuestion): OptionValidationResult {
  const issues: string[] = [];

  if (!q.options || typeof q.options !== 'object') {
    return { isValid: false, issues: ['Options object is missing or not a dictionary'] };
  }

  const expectedKeys: Array<'a' | 'b' | 'c' | 'd'> = ['a', 'b', 'c', 'd'];
  const actualKeys = Object.keys(q.options);

  // 1. Check for missing or extra keys
  const missingKeys = expectedKeys.filter((k) => !(k in q.options));
  if (missingKeys.length > 0) {
    issues.push(`Missing option keys: ${missingKeys.map((k) => k.toUpperCase()).join(', ')}`);
  }

  const extraKeys = actualKeys.filter((k) => !expectedKeys.includes(k as any));
  if (extraKeys.length > 0) {
    issues.push(`Unexpected extra option keys: ${extraKeys.join(', ')}`);
  }

  // 2. Check each option is non-empty
  for (const k of expectedKeys) {
    const val = q.options[k];
    if (typeof val !== 'string' || val.trim().length === 0) {
      issues.push(`Option (${k.toUpperCase()}) is blank or empty`);
    }
  }

  // 3. Check that all 4 options are distinct
  const seenValues = new Map<string, string>();
  for (const k of expectedKeys) {
    const val = typeof q.options[k] === 'string' ? q.options[k].trim() : '';
    if (val.length > 0) {
      if (seenValues.has(val)) {
        const firstKey = seenValues.get(val)!;
        issues.push(
          `Duplicate options: Option (${firstKey.toUpperCase()}) and Option (${k.toUpperCase()}) have identical content: "${val}"`
        );
      } else {
        seenValues.set(val, k);
      }
    }
  }

  // 4. Quality & placeholder check
  for (const k of expectedKeys) {
    const val = typeof q.options[k] === 'string' ? q.options[k].trim() : '';
    if (
      val.includes('[Refer to Question Diagram') ||
      val.includes('[Option') ||
      val.includes('extraction error')
    ) {
      issues.push(`Placeholder / fallback text in Option (${k.toUpperCase()}): "${val}"`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Validates an entire array of CBT questions and returns a structured audit summary.
 */
export function validateDataset(questions: CbtQuestion[]): DatasetValidationSummary {
  const flagged: DatasetValidationSummary['flagged'] = [];
  let validCount = 0;

  for (const q of questions) {
    const result = validateQuestionOptions(q);
    if (result.isValid) {
      validCount++;
    } else {
      flagged.push({
        id: q.id,
        subject: q.subject || 'Unknown',
        section: q.section || 'Unknown',
        questionSnippet: (q.question || '').slice(0, 80).replace(/\n/g, ' '),
        issues: result.issues,
        options: q.options || {},
      });
    }
  }

  return {
    total: questions.length,
    validCount,
    flaggedCount: flagged.length,
    flagged,
  };
}
