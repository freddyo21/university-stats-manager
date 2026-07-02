import "./index.css";

export default function PrivacyPage() {
    return (
        <>
            <main className="privacy-container">
                <header className="privacy-header">
                    <h1>PRIVACY POLICY FOR UNIVERSITY STATISTICS MANAGER EXTENSION BRIDGE</h1>
                    <p className="last-updated">
                        <strong>Last Updated:</strong> July 2026
                    </p>
                </header>

                <section className="privacy-section">
                    <h2>1. INTRODUCTION</h2>
                    <p>
                        This Privacy Policy governs the data protection practices for the "University Statistics Manager Extension Bridge" browser extension. We are committed to maintaining the trust and confidence of our users.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>2. DATA COLLECTION AND USAGE</h2>
                    <p>
                        Currently, the University Statistics Manager Extension Bridge DOES NOT collect, store, or transmit any personally identifiable information (PII) or sensitive user data to any external or third-party servers.
                    </p>
                    <ul className="privacy-list">
                        <li>
                            All data extraction and processing (such as academic grades parsing) are executed completely LOCAL on the user's local machine within the browser sandbox.
                        </li>
                        <li>
                            Data transmission only occurs directly between the authenticated institutional portal and the user's active University Statistics Manager web dashboard via secure local browser messaging (window.postMessage) upon explicit user initiation.
                        </li>
                    </ul>
                </section>

                <section className="privacy-section">
                    <h2>3. LOCAL STORAGE</h2>
                    <p>
                        The extension may utilize the browser's local storage API solely to store non-sensitive configuration data, such as layout preferences, theme settings, or temporary local session states, to ensure a seamless user experience.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>4. FUTURE CHANGES TO THIS POLICY</h2>
                    <p>
                        We reserve the right to update this Privacy Policy as the extension evolves and new features are introduced. If any future updates require network transmission or remote data storage, this policy will be updated accordingly, and users will be notified transparently through the extension interface or marketplace update logs.
                    </p>
                </section>

                <section className="privacy-section">
                    <h2>5. CONTACT US</h2>
                    <p>
                        If you have any questions regarding this Privacy Policy, you can contact the developer group via our official repository at GitHub or through the main University Statistics Manager application platform.
                    </p>
                </section>
            </main>
        </>
    );
}