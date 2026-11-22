// Run from the Backend folder:  node src/seedProblems.js
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();

const mongoose = require('mongoose');
const main = require('./config/db');
const Problem = require('./models/problem');
const User = require('./models/user');

/* ---------- Code templates (stdin -> stdout, as Judge0 expects) ---------- */
// kind 'array': input is "n" then n numbers.  kind 'int': input is a single number n.
const param = (kind) => (kind === 'array' ? 'nums' : 'n');

const wrapJS = (kind, body) => `const input = require('fs').readFileSync(0, 'utf8').trim().split(/\\s+/).map(Number);
const n = input[0];
${kind === 'array' ? 'const nums = input.slice(1, 1 + n);\n' : ''}
function solve(${param(kind)}) {
  ${body}
}

console.log(solve(${param(kind)}));`;

const wrapCpp = (kind, body) => `#include <bits/stdc++.h>
using namespace std;

long long solve(${kind === 'array' ? 'vector<int>& nums' : 'int n'}) {
  ${body}
}

int main() {
  int n;
  cin >> n;
${kind === 'array' ? '  vector<int> nums(n);\n  for (auto &x : nums) cin >> x;\n' : ''}  cout << solve(${param(kind)}) << endl;
  return 0;
}`;

const wrapJava = (kind, body) => `import java.util.*;

public class Main {
  static long solve(${kind === 'array' ? 'int[] nums' : 'int n'}) {
    ${body}
  }

  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    int n = sc.nextInt();
${kind === 'array' ? '    int[] nums = new int[n];\n    for (int i = 0; i < n; i++) nums[i] = sc.nextInt();\n' : ''}    System.out.println(solve(${param(kind)}));
  }
}`;

const STUB = {
  JavaScript: '// write your code here',
  'C++': '// write your code here\n  return 0;',
  Java: '// write your code here\n    return 0;',
};

const build = (kind, solutions) => ({
  startCode: [
    { language: 'JavaScript', initialCode: wrapJS(kind, STUB.JavaScript) },
    { language: 'C++', initialCode: wrapCpp(kind, STUB['C++']) },
    { language: 'Java', initialCode: wrapJava(kind, STUB.Java) },
  ],
  referenceSolution: [
    { language: 'JavaScript', completeCode: wrapJS(kind, solutions.js) },
    { language: 'C++', completeCode: wrapCpp(kind, solutions.cpp) },
    { language: 'Java', completeCode: wrapJava(kind, solutions.java) },
  ],
});

/* ---------- Problems ---------- */
const problems = [
  {
    title: 'Maximum Element',
    difficulty: 'easy',
    tags: 'array',
    description:
      'Given an array of n integers, print the largest element.\n\nInput format:\nThe first line contains n.\nThe second line contains n space-separated integers.\n\nOutput format:\nPrint the maximum element.\n\nConstraints:\n1 <= n <= 100000\n-10^9 <= a[i] <= 10^9',
    visibleTestCases: [
      { input: '5\n3 9 2 7 1', output: '9', explanation: '9 is the largest value.' },
      { input: '3\n-5 -2 -9', output: '-2', explanation: 'All values are negative, -2 is the largest.' },
    ],
    hiddenTestCases: [
      { input: '1\n42', output: '42' },
      { input: '6\n10 10 10 10 10 10', output: '10' },
      { input: '4\n-1 0 -3 -4', output: '0' },
      { input: '7\n1 2 3 4 5 6 100', output: '100' },
    ],
    ...build('array', {
      js: 'let m = nums[0]; for (const x of nums) if (x > m) m = x; return m;',
      cpp: 'return *max_element(nums.begin(), nums.end());',
      java: 'long m = nums[0]; for (int x : nums) m = Math.max(m, x); return m;',
    }),
  },
  {
    title: 'Climbing Stairs',
    difficulty: 'easy',
    tags: 'dp',
    description:
      'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. Print the number of distinct ways to reach the top.\n\nInput format:\nA single integer n.\n\nOutput format:\nPrint the number of ways.\n\nConstraints:\n1 <= n <= 45',
    visibleTestCases: [
      { input: '2', output: '2', explanation: 'Two ways: 1+1 and 2.' },
      { input: '3', output: '3', explanation: 'Three ways: 1+1+1, 1+2 and 2+1.' },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '4', output: '5' },
      { input: '5', output: '8' },
      { input: '10', output: '89' },
      { input: '20', output: '10946' },
      { input: '45', output: '1836311903' },
    ],
    ...build('int', {
      js: 'let a = 1, b = 1; for (let i = 2; i <= n; i++) { [a, b] = [b, a + b]; } return b;',
      cpp: 'long long a = 1, b = 1; for (int i = 2; i <= n; i++) { long long c = a + b; a = b; b = c; } return b;',
      java: 'long a = 1, b = 1; for (int i = 2; i <= n; i++) { long c = a + b; a = b; b = c; } return b;',
    }),
  },
  {
    title: 'Maximum Subarray',
    difficulty: 'medium',
    tags: 'array',
    description:
      'Given an array of n integers, find the contiguous subarray with the largest sum and print that sum.\n\nInput format:\nThe first line contains n.\nThe second line contains n space-separated integers.\n\nOutput format:\nPrint the largest subarray sum.\n\nConstraints:\n1 <= n <= 100000\n-10000 <= a[i] <= 10000',
    visibleTestCases: [
      { input: '9\n-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.' },
      { input: '1\n5', output: '5', explanation: 'A single element is a valid subarray.' },
    ],
    hiddenTestCases: [
      { input: '5\n1 2 3 4 5', output: '15' },
      { input: '4\n-3 -1 -2 -5', output: '-1' },
      { input: '6\n5 -9 6 -2 3 1', output: '8' },
      { input: '8\n2 -1 2 -1 2 -1 2 -1', output: '5' },
    ],
    ...build('array', {
      js: 'let best = nums[0], cur = nums[0]; for (let i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); } return best;',
      cpp: 'long long best = nums[0], cur = nums[0]; for (int i = 1; i < (int)nums.size(); i++) { cur = max((long long)nums[i], cur + nums[i]); best = max(best, cur); } return best;',
      java: 'long best = nums[0], cur = nums[0]; for (int i = 1; i < nums.length; i++) { cur = Math.max(nums[i], cur + nums[i]); best = Math.max(best, cur); } return best;',
    }),
  },
  {
    title: 'House Robber',
    difficulty: 'medium',
    tags: 'dp',
    description:
      'A row of n houses each holds some money. You cannot rob two adjacent houses. Print the maximum amount you can rob.\n\nInput format:\nThe first line contains n.\nThe second line contains n space-separated integers, the money in each house.\n\nOutput format:\nPrint the maximum amount.\n\nConstraints:\n1 <= n <= 100000\n0 <= a[i] <= 10000',
    visibleTestCases: [
      { input: '4\n1 2 3 1', output: '4', explanation: 'Rob house 1 and house 3: 1 + 3 = 4.' },
      { input: '5\n2 7 9 3 1', output: '12', explanation: 'Rob houses 1, 3 and 5: 2 + 9 + 1 = 12.' },
    ],
    hiddenTestCases: [
      { input: '1\n5', output: '5' },
      { input: '2\n2 1', output: '2' },
      { input: '6\n6 7 1 30 8 2', output: '39' },
      { input: '5\n100 1 1 100 1', output: '200' },
      { input: '3\n0 0 0', output: '0' },
    ],
    ...build('array', {
      js: 'let prev = 0, curr = 0; for (const x of nums) { const next = Math.max(curr, prev + x); prev = curr; curr = next; } return curr;',
      cpp: 'long long prev = 0, curr = 0; for (int x : nums) { long long nx = max(curr, prev + x); prev = curr; curr = nx; } return curr;',
      java: 'long prev = 0, curr = 0; for (int x : nums) { long nx = Math.max(curr, prev + x); prev = curr; curr = nx; } return curr;',
    }),
  },
  {
    title: 'Trapping Rain Water',
    difficulty: 'hard',
    tags: 'array',
    description:
      'Given n non-negative integers representing an elevation map where each bar has width 1, compute how much water it can trap after raining.\n\nInput format:\nThe first line contains n.\nThe second line contains n space-separated integers, the bar heights.\n\nOutput format:\nPrint the total units of trapped water.\n\nConstraints:\n1 <= n <= 100000\n0 <= height[i] <= 100000',
    visibleTestCases: [
      { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', output: '6', explanation: 'Six units of water are trapped between the bars.' },
      { input: '6\n4 2 0 3 2 5', output: '9', explanation: 'Water fills the gaps between the 4 and the 5.' },
    ],
    hiddenTestCases: [
      { input: '3\n1 0 1', output: '1' },
      { input: '1\n5', output: '0' },
      { input: '5\n5 4 3 2 1', output: '0' },
      { input: '5\n2 0 2 0 2', output: '4' },
      { input: '7\n3 0 0 2 0 4 1', output: '10' },
    ],
    ...build('array', {
      js: 'let l = 0, r = nums.length - 1, lm = 0, rm = 0, water = 0; while (l < r) { if (nums[l] < nums[r]) { if (nums[l] >= lm) lm = nums[l]; else water += lm - nums[l]; l++; } else { if (nums[r] >= rm) rm = nums[r]; else water += rm - nums[r]; r--; } } return water;',
      cpp: 'int l = 0, r = (int)nums.size() - 1; long long lm = 0, rm = 0, water = 0; while (l < r) { if (nums[l] < nums[r]) { if (nums[l] >= lm) lm = nums[l]; else water += lm - nums[l]; l++; } else { if (nums[r] >= rm) rm = nums[r]; else water += rm - nums[r]; r--; } } return water;',
      java: 'int l = 0, r = nums.length - 1; long lm = 0, rm = 0, water = 0; while (l < r) { if (nums[l] < nums[r]) { if (nums[l] >= lm) lm = nums[l]; else water += lm - nums[l]; l++; } else { if (nums[r] >= rm) rm = nums[r]; else water += rm - nums[r]; r--; } } return water;',
    }),
  },
];

/* ---------- Insert ---------- */
(async () => {
  try {
    await main();
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) throw new Error('No admin user found. Make one with the admin register route first.');

    // Read the allowed values from YOUR schema so the casing always matches
    const diffPath = Problem.schema.path('difficulty');
    const tagPath = Problem.schema.path('tags');
    const tagIsArray = tagPath.instance === 'Array';
    const diffEnum = diffPath.enumValues || [];
    const optEnum = Array.isArray(tagPath.options?.enum) ? tagPath.options.enum : [];
    const tagEnum =
      (tagIsArray
        ? tagPath.embeddedSchemaType?.enumValues || tagPath.caster?.enumValues
        : tagPath.enumValues) ||
      optEnum;
    console.log('Schema difficulty values:', diffEnum);
    console.log('Schema tag values:', tagEnum);

    const norm = (v) => String(v).toLowerCase().replace(/[^a-z0-9]/g, '');
    const ALIASES = { array: ['array', 'arrays'], dp: ['dp', 'dynamicprogramming'] };
    const pick = (list, wanted, aliases = [wanted]) => {
      if (!list.length)
        throw new Error('Could not read the allowed values for "' + wanted + '" from your schema. Open models/problem.js and paste the tags line.');
      const hit = list.find((v) => aliases.includes(norm(v)));
      if (!hit) throw new Error(`"${wanted}" is not allowed. Allowed values: ${list.join(', ')}`);
      return hit;
    };

    let added = 0;
    for (const raw of problems) {
      if (await Problem.findOne({ title: raw.title })) {
        console.log('Skipped (already exists):', raw.title);
        continue;
      }
      const tag = pick(tagEnum, raw.tags, ALIASES[raw.tags]);
      const p = {
        ...raw,
        difficulty: pick(diffEnum, raw.difficulty),
        tags: tagIsArray ? [tag] : tag,
      };
      await Problem.create({ ...p, problemCreator: admin._id });
      console.log('Added:', p.title);
      added++;
    }
    console.log(`Done. ${added} new problem(s) added.`);
  } catch (err) {
    console.error('Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();