# Study Stats Suite - Core Grading Logic Engine

A core library for processing and calculating advanced academic metrics (GPA/CPA) for students, optimized for standard credit-based academic regulations and flexibly configurable for individual universities.

---

## 🚀 Core Features & Business Logic

- **Deterministic Floating-Point Precision:** Standardized decimal rounding algorithms (compensating for IEEE 754 binary floating-point errors) to ensure absolute accuracy in score data when calculating 10-point scale averages.
- **Decoupled GPA/CPA Processing:** Modular business logic design separating two data streams:
  - **Semester GPA:** Evaluates the full set of courses registered for the term to accurately reflect academic performance.
  - **Cumulative GPA (CPA):** Implements an automatic "Drop-Filter" algorithm to exclude failed courses from both the numerator and denominator; data is updated only upon the recording of a successful course retake.
- **Zero-Score Credit Isolation:** Automatically identifies and isolates exempt courses. The system aggregates these credits into the program total while completely excluding their score values ​​from the average calculation to prevent data distortion.
- **Dynamic Precision Configuration:** Supports dynamic configuration of decimal places (1 or 2 digits) across the entire stack—from the UI layer down to core utilities—via a runtime synchronization mechanism.
- **Data-Driven Scale Mapping (No Hardcoding):** Eliminates hardcoded grading scales. Implements a dynamic range mapping mechanism driven by university-specific policy configuration files at runtime.

## 🧩 Extension: Grade Crawler Assistant (Chrome Extension)

Developed a standalone Chrome Extension (Manifest V3) utilizing a **Secure Data Pipeline** architecture to automate the extraction of academic data directly from the academic portal (e.g., UIT's `daa.uit.edu.vn` portal) without requiring manual password entry by the user.

### 🛡️ Security Mechanism & Data Pipeline

To navigate the portal's strict security policies—specifically **CORS** and **Content Security Policy (CSP)** restrictions against `unsafe-eval` or `inline scripts`—the extension utilizes a **Bridge Content Script** model combined with an **Isolated World** architecture:

1. **Popup Interaction:** An independent popup interface allows users to trigger the data scraping process without requiring write permissions or direct interaction with the university's academic portal.
2. **Local Strategy Matching:** The extension automatically detects the current domain and activates the corresponding, locally embedded extraction function (e.g., `uitScrapingStrategy`), strictly adhering to Manifest V3 policies prohibiting remote code execution.
3. **Isolated Execution:** Extraction algorithms run within an *Isolated World* to bypass CSP restrictions, handle complex HTML structures, normalize weights and scores, and output data in a secure JSON format.
4. **Cross-Origin Bridge:** JSON data is relayed via `chrome.tabs.sendMessage` to `bridge-content-script.js` and then passed using `window.postMessage`—with strict Origin validation (`window.location.origin`)—to directly update the web application's React Context.

### 📂 `manifest.json` settings

```json
{
    "manifest_version": 3,
    "name": "Grade Crawler Assistant",
    "version": "1.0.0",
    "description": "Hỗ trợ lấy GPA và CPA từ website các trường đại học",
    "permissions": [
        "scripting",
        "activeTab",
        "storage",
        "tabs"
    ],
    "host_permissions": [
        "http://localhost:3000/*",
        "http://localhost:5173/*",
        "https://study-stats-suite.vercel.app/*"
    ],
    "optional_host_permissions": [
        "https://*.edu/*",
        "https://*.edu.vn/*",
        "http://*.edu/*",
        "http://*.edu.vn/*"
    ],
    "background": {
        "service_worker": "background.js",
        "type": "module"
    },
    "action": {
        "default_popup": "popup.html",
        "default_title": "Grade Crawler Assistant"
    },
    "content_scripts": [
        {
            "matches": [
                "http://localhost:3000/*",
                "https://study-stats-suite.vercel.app/*",
                "http://localhost:5173/*"
            ],
            "js": [
                "bridge-content-script.js"
            ]
        }
    ],
    "externally_connectable": {
        "matches": [
            "http://localhost:3000/*",
            "https://study-stats-suite.vercel.app/*",
            "http://localhost:5173/*"
        ]
    }
}
```

### How it works:
- **Extension Popup:** A standalone interface that appears when the user clicks the extension icon; it contains a button to trigger the data scraping process without modifying the school website's DOM.
- **Background Script:** Listens for commands from the Popup, triggers the corresponding locally integrated data extraction function, and passes the JSON result to the Content Script.
- **Bridge Content Script:** Runs on the Web App ([study-stats-suite.vercel.app](https://study-stats-suite.vercel.app)), securely receives the JSON data, and updates the application's state manager directly.

### Notes:
- **Just-In-Time Permissions:** To ensure absolute user privacy, the extension does not request permanent access permissions (host_permissions) for the academic portal in the Manifest file upfront. The system only triggers an API request for temporary permission for a specific domain when the user clicks to scrape grades from that page.
- **Zero-Server Storage:** All sensitive data (such as grade reports and student IDs) is transmitted directly via the secure internal Chrome runtime pipeline to the Web App; it is never stored or sent to any intermediate servers.
- **Data Synchronization Process:** Before opening the Popup to scrape grades, the user must ensure they are already logged into the school's academic portal in a browser tab and have the website [study-stats-suite.vercel.app](https://study-stats-suite.vercel.app) open simultaneously.

---

## 🛠️ Design Patterns

The project employs standard design patterns to ensure clean, scalable, and maintainable code:

1. **Strategy Pattern:** The mechanism for point conversion and scholarship/target threshold determination dynamically switches algorithms based on the grading scale configuration state (`activeScale: "10" | "4" | "100"`).

---

## 📂 Core Computational Logic Source Code

Designed a decoupled, modular computation engine (`calc.ts`) utilizing deterministic algorithms to eliminate binary floating-point errors (IEEE 754) and independent data pipelines for Full-set Semester GPA aggregation and Drop-Filter Cumulative CPA processing.


```typescript
// Standardize the rounding algorithm (compensating for IEEE 754 errors) to ensure deterministic base-10 calculations
export function subjectScore10(subject: Subject, precision: number = 2): number | null;

// Apply a full-set aggregation mechanism across all registration records to calculate the semester GPA (base-10)
export function semesterGPA10(s: Semester, ...): { gpa10: number | null; credits: number; ... };

// Activate the drop-filter mechanism to exclude failed courses and isolate exempted course grades when calculating the cumulative GPA (base-4)
export function cumulativeGPA4(semesters: Semester[], letterGrades: LetterGradeRange[], ...): { gpa4: number | null; credits: number; ... };
```

## 📦 Project deployment command
Run TypeScript strict-type syntax checks and bundle the application:

```bash
# Examine TypeScript strict-type errors and build the production bundle
npm run build
# Or run manually via the TypeScript chain:
tsc -b && vite build
```

---
## 📝 Contribution Guidelines

* **Strict TypeScript**: Always declare data types explicitly; strictly avoid overusing the `any` type.
* **Zod Validation**: Use Zod v4 to validate grading scale configuration data passed into the system; do not use functions or methods deprecated in older versions.

---

## 📬 Contact & Support

If you have any questions, suggestions, or discover any logic or security vulnerabilities in this codebase, please contact me via the following channels:



---
*The project is built and developed with the goal of optimizing personal learning management efficiency, while adhering to clean code standards and object-oriented system design principles.*