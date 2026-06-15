import Header from "./Header";
import Footer from "./Footer";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "../Modals/AuthModal";
import { useLogReg } from "../Modals/LogRegProvider";

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLogin, isForgot, isModalOpen, openLoginModal, openRegisterModal, closeModal } = useLogReg();

    const text = [
        {
            title: "Who We Are",
            content: [
                "Salimbigkas (operated by SYNERGY) provides an AI-assisted Filipino learning platform for elementary students.",
            ]
        },
        {
            title: "Scope & Applicability",
            content: [
                "This Policy applies to personal information collected through our websites, mobile apps, APIs and other services (collectively, the “Platform”), including during registration, use of lessons/quizzes/phrases, analytics, and recommendation."
            ]
        },
        {
            title: "Information We Collect",
            content: [
                "We collect only what we need to provide educational services. Categories include:",
                {
                    category: "Account & Identity Information",
                    details: [
                        "Name, display name, email, phone number, school, grade, role (student/teacher/parent/admin), profile photo.",
                    ],
                },
                {
                    category: "Authentication & Security",
                    details: [
                        "Email/password (hashed), third-party auth tokens, login history, device identifiers, multi-factor auth info if used."
                    ],
                },
                {
                    category: "Educational Data (Academic Records)",
                    details: [
                        "Lesson progress, quiz responses and scores, badges, teacher feedback, and submission timestamps.",
                    ],
                },
                {
                    category: "Usage & Device Data (Technical)",
                    details: [
                        "IP address (during sign-in), device type, browser, OS, session duration, pages visited, and crash logs.",
                    ],
                },
                {
                    category: "Cookies & Tracking",
                    details: [
                        "Cookies, sessionStorage, localStorage, analytics identifiers for usage monitoring and performance."
                    ],
                },
                {
                    category: "AI Interaction Data",
                    details: [
                        "Prompts sent to AI, AI responses (including generated quizzes, phrases, and lesson info), and metadata about generation requests. We may store prompts/responses for quality improvement and moderation; see Section on AI."
                    ],
                },
            ]
        },
        {
            title: "Sources of Information",
            content: [
                "Provided directly by users (during registration, profile updates, quizzes, phrases, lessons, and AI interactions).",
                "Automatically collected (device and usage data).",
                "From third parties (schools, identity providers).",
            ]
        },
        {
            title: "Purpose & Legal Basis for Processing",
            content: [
                "We process personal data for the purposes below. Where applicable laws require, we will identify the legal basis (consent, contract performance, legal obligation, legitimate interest).",
                {
                    category: "Purposes:",
                    details: [
                        "Provide and operate the Platform and learning services.",
                        "Authenticate users and manage Accounts.",
                        "Personalize learning paths, recommendations and content.",
                        "Deliver AI-generated quizzes, phrases, and store results.",
                        "Communicate with teachers, parents and students about progress and notifications.",
                        "System administration, security, fraud detection and analytics.",
                        "Compliance with legal obligations.",
                    ],
                },
            ]
        },
        {
            title: "Children & Parental Consent",
            content: [
                "The Platform is targeted to elementary students. For children below the legal age of consent:",
                {
                    details: [
                        "Parents/guardians must create and control the child’s Account and provide consent.",
                        "We collect minimal necessary information for educational purposes.",
                        "Parents may review, request corrections to, or request deletion of their child’s data (see Rights section).",
                        "We do not condition participation on the provision of more personal data than necessary.",
                    ],
                },
            ]
        },
        {
            title: "AI & Third-Party AI Providers",
            content: [
                "We may use third-party AI services (e.g., Google Cloud/Firebase/EleveLabs) to generate quizzes, phrases, recommendations, or text-to-speech.",
                "Prompts and AI responses may be transmitted to and processed by such providers. We take steps to limit the exposure of personal data in prompts and will not send sensitive personal identifiers unless necessary and with consent.",
                "AI outputs are educational aids and may require teacher validation. We are not liable for AI inaccuracies.",
            ]
        },
        {
            title: "Sharing & Disclosure",
            content: [
                "We may share personal data with:",
                {
                    details: [
                        "Service Providers: hosting (Firebase/Google Cloud), analytics, AI providers.",
                        "Schools / Teachers / Parents: student progress is visible to authorized teachers and parents as part of service delivery.",
                        "Legal & Safety: when required by law, regulation or to respond to legal process; to protect rights and safety.",

                    ],
                }
            ]
        },
        {
            title: "Data Retention",
            content: [
                "We retain personal data only as long as necessary for the purposes described or as required by law. Typical retention periods:",
                {
                    details: [
                        "Account data: retained while Account is active + 2 years after deletion requests (unless otherwise requested).",
                        "Quiz responses & progress: retained for the academic year + 2 years for analytics and school reporting.",
                        "Logs & diagnostics: retained up to 12 months.",
                        "Backups: retained per backup policy (up to 90 days) for disaster recovery.",
                    ],
                },
                "You may request earlier deletion; please note some data may persist in anonymized aggregate form."
            ]
        },
        {
            title: "Third-Party Services",
            content: [
                "The Platform may integrate third-party services (e.g., Firebase AI Logic for AI generation, Google/Firebase for hosting). Use of third-party services is subject to their own terms and privacy policies.",
                "We do not control and are not responsible for third-party content or services."
            ]
        },
        {
            title: "Security",
            content: [
                "We implement industry-standard measures including:",
                {
                    details: [
                        "Encryption of data in transit (TLS) and at rest (Google Cloud/Firebase encryption).",
                        "Access control and role-based permissions for staff.",
                        "Audit logging, intrusion detection and security reviews.",
                        "Periodic security and privacy training for staff.",
                        "Continuous monitoring and patching.",
                    ],
                },
                "No system is 100% secure; if a data breach occurs, we will notify affected parties and regulators per applicable law.",
            ]
        },
        {
            title: "Your Rights & How to Exercise Them",
            content: [
                "Subject to local law, you may have rights including:",
                {
                    details: [
                        "Access: request a copy of your personal data.",
                        "Rectification: correct inaccurate or incomplete data.",
                        "Deletion: request erasure (subject to retention obligations).",
                        "Restriction: limit processing in certain circumstances.",
                        "Portability: request export of your data in machine-readable format.",
                        "Objection: object to processing based on legitimate interests.",
                        "Withdraw consent: where processing is based on consent.",
                    ],
                },
                "To exercise rights, contact the administrator. We will verify identity and respond within legal timelines."
            ]
        },
        {
            title: "Cookies & Tracking",
            content: [
                "We use cookies and similar technologies for authentication, security, performance and analytics. You can manage cookie preferences in your browser.",
            ]
        },
        {
            title: "International Users & Governing Law",
            content: [
                "If you are outside the Philippines, your data may be processed in other jurisdictions. We aim to comply with applicable privacy laws (e.g., Philippine Data Privacy Act, GDPR). This Policy is governed by the laws of Philippines."
            ]
        },
        {
            title: "Policy Updates",
            content: [
                "We may update this Policy. Material changes will be notified via the Platform. The revised Policy will show the updated “Last Updated” date."
            ]
        },
        {
            title: "Complaints & Supervisory Authority",
            content: [
                "If you are unsatisfied with our response, you may contact your local data protection authority (e.g., National Privacy Commission in the Philippines)."
            ]
        },
        {
            title: "Additional Operational Notes (How we use Firebase & AI in practice)",
            content: [
                "Firebase: Authentication, Firestore, Storage and Functions host and manage data. Google’s security practices apply; we maintain custom Firestore rules to enforce least privilege.",
                "AI usage (Google Cloud/Firebase AI Logic/ElevenLabs): we store prompts & responses for debugging/improvement in protected collections; we remove PII from prompts whenever possible.",
            ]
        }
    ]

    return (
        <div className="flex flex-col mx-auto bg-white">
            <div className="w-full sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <nav className="max-w-[1440px] mx-auto flex justify-center items-center">
                    <Header
                        openHomePage={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        openAboutPage={() => {
                            if (location.pathname !== "/about-us") {
                                navigate("/about-us");
                            }
                        }}
                        openFeaturesPage={() =>
                            document
                            .getElementById("features")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        openContactPage={() =>
                            document
                            .getElementById("contact")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        openLoginModal={openLoginModal}
                    />
                </nav>
            </div>
            <div className="flex-1 p-30 bg-[#2C3E50] text-white flex flex-col gap-4">
                <h1 className="chalk-text text-8xl font-bold">Privacy Policy</h1>
            </div>
            <div className="flex-1 w-full bg-[#F9FAFB]">
                <main className="flex flex-1 text-left max-w-[1440px] mx-auto ">
                    <div className="flex-1 px-30 py-10">
                        <ul className="mb-8 list-inside space-y-2">
                            {text.map((section, idx) => (
                                <li key={idx}>
                                    <button
                                        type="button"
                                        title={`Go to section ${section.title}`}
                                        className="w-full text-left text-xl text-[#2C3E50] hover:text-[#FFA600] hover:underline bg-transparent border-b border-gray-200 py-10 cursor-pointer"
                                        onClick={() => {
                                            document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: "smooth" });
                                        }}
                                    >
                                        <span>{section.title}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-3 flex-col gap-4 py-20 mr-40">
                        <div className="flex flex-col gap-4 mb-2">
                            <h2 className="text-sm">Effective Date: September 19, 2025</h2>
                            <h2 className="text-lg">Last Updated: September 19, 2025</h2>
                        </div>
                        <p className="text-xl">This Privacy Policy explains how Salimbigkas collects, uses, shares and protects personal information of users of the Salimbigkas Platform. We are committed to protecting the privacy of students, parents, teachers and administrators. By using the Platform you consent to the practices described below.</p>
                        <p className="text-xl px-4"><b>Note:</b> If you are under the age required by law to consent to data processing (e.g., 13 in many jurisdictions), you must have a parent or guardian register and consent on your behalf.</p>
                        {text.map((section, idx) => (
                            <div key={idx} id={`section-${idx}`} className="text-xl space-y-2 mt-4 mb-2 scroll-mt-25">
                                <h3 className="text-4xl font-bold">{`${idx + 1}. ${section.title}`}</h3>
                                <ul className="list-inside space-y-2">
                                    {(() => {
                                        let letterIdx = 0;
                                        return section.content.map((item, i) => {
                                            if (typeof item === "string") {
                                                return <li key={i}>{item}</li>;
                                            }
                                            if ("category" in item && Array.isArray(item.details)) {
                                                const letter = String.fromCharCode(65 + letterIdx); // A, B, C...
                                                letterIdx++;
                                                return (
                                                    <li key={i} className="ml-4">
                                                        <span className="font-semibold">{letter}. {item.category}</span>
                                                        <ul className="list-disc list-inside ml-6">
                                                            {item.details.map((detail: string, j: number) => (
                                                                <li key={j}>{detail}</li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                );
                                            }
                                            if ("details" in item && Array.isArray(item.details)) {
                                                return (
                                                    <li key={i} className="ml-2">
                                                        <ul className="list-disc list-inside ml-6">
                                                            {item.details.map((detail: string, j: number) => (
                                                                <li key={j}>{detail}</li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                );
                                            }
                                            return null;
                                        });
                                    })()}
                                </ul>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
            <div className="w-full bg-white shadow-sm rounded-tl-4xl rounded-tr-4xl border border-gray-200">
                <div className="max-w-[1440px] mx-auto flex flex-col px-25 py-10 justify-center items-center">
                    <Footer />
                </div>
            </div>
            <AuthModal
                isModalOpen={isModalOpen}
                isLogin={isLogin}
                isForgot={isForgot}
                closeModal={closeModal}
                openLoginModal={openLoginModal}
                openRegisterModal={openRegisterModal}
            />
        </div>
    )
}

export default PrivacyPolicy;