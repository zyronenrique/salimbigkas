import Header from "./Header";
import Footer from "./Footer";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "../Modals/AuthModal";
import { useLogReg } from "../Modals/LogRegProvider";

const TermsOfService = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLogin, isForgot, isModalOpen, openLoginModal, openRegisterModal, closeModal } = useLogReg();

    const text = [
        {
            title: "Definitions",
            content: [
                "Platform: the Salimbigkas web and mobile applications, websites, APIs, content, services and related features provided by Salimbigkas.",
                "User / you: anyone who accesses or uses the Platform — students, parents, teachers, administrators.",
                "Account: an authenticated user account.",
                "Content: lessons, quizzes, phrases, videos, audio, text, images, badges, user-generated content, and AI-generated content available on the Platform.",
                "AI Services: automated content generation performed by third-party AI provider, Firebase AI Logic by Google/Firebase and ElevenLabs."
            ]
        },
        {
            title: "Acceptance of Terms",
            content: [
                "By accessing or using the Platform, you accept and agree to these Terms. If you do not agree, do not use the Platform."
            ]
        },
        {
            title: "Eligibility & Parental Consent",
            content: [
                "The Platform is intended for elementary-level learners. If you are under the legal age of consent in your jurisdiction (or under 13 where applicable), you must register and use the Platform with the consent of a parent or legal guardian. Parents/guardians must provide consent during registration where required.",
                "Teachers and school administrators must be authorized by their institutions to use the Platform on behalf of students."
            ]
        },
        {
            title: "Account Security & Responsibility",
            content: [
                "You must provide accurate information when creating an Account. Keep your password secure. You are responsible for all activity occurring under your Account.",
                "Notify us immediately of any unauthorized use. We may suspend or terminate Accounts for suspicious activity.",
                "Teachers/Administrators are responsible for managing their class rosters and for verifying student accounts as required by school policy."
            ]
        },
        {
            title: "Use of the Platform",
            content: [
                "The Platform is for educational use only. Use the Platform honestly, lawfully, and consistent with these Terms and any school rules.",
                "Prohibited uses include (but are not limited to): cheating, uploading illegal content, harassment, circumventing access controls (e.g., attempting to unlock quizzes, levels, lessons without authorization), and attempting to access other users’ data."
            ]
        },
        {
            title: "Content, AI-Generated Material & Accuracy",
            content: [
                "The Platform includes content created by Salimbigkas, teachers, and AI. AI may be used to generate quizzes, phrases, text-to-speech,or recommendation",
                "AI-generated content is intended as an educational aid. While we strive for accuracy, AI outputs may sometimes be inaccurate or incomplete. You should not rely solely on AI outputs for grading or critical decisions without teacher review.",
                "Teachers are responsible for reviewing and approving AI-generated quizzes, phrases, text-to-speech, or lesson materials before assigning them to students (where applicable)."
            ]
        },
        {
            title: "User-Generated Content",
            content: [
                "Users (admins, teachers, students, parents) may upload content (e.g., answers, uploaded files). You grant Salimbigkas a non-exclusive, worldwide, royalty-free license to host, store, reproduce and display such content for Platform operation and improvement.",
                "Do not upload private personal data about others without consent. Salimbigkas may remove or disable content violating these Terms."
            ]
        },
        {
            title: "Intellectual Property",
            content: [
                "Salimbigkas and its licensors retain all intellectual property rights in the Platform and original content. You may not reproduce, modify, distribute, or create derivative works of our content except as expressly permitted.",
                "Teachers retain ownership of their teacher-created materials unless otherwise agreed; by uploading teacher content, you grant Salimbigkas a license to use and display it on the Platform."
            ]
        },
        {
            title: "Feedback & Improvements",
            content: [
                "If you provide feedback or suggestions, you grant Salimbigkas a perpetual, worldwide, royalty-free license to use, modify and commercialize such feedback."
            ]
        },
        {
            title: "Third-Party Services",
            content: [
                "The Platform may integrate third-party services (e.g., Firebase AI Logic for AI generation, Google/Firebase for hosting, ElevenLabs for text-to-speech). Use of third-party services is subject to their own terms and privacy policies.",
                "We do not control and are not responsible for third-party content or services."
            ]
        },
        {
            title: "Security & Privacy",
            content: [
                "Our Privacy Policy explains how we collect, use and disclose personal data. By using the Platform you consent to such collection and use.",
                "We implement security measures (encryption in transit and at rest for stored data, access controls) but cannot guarantee absolute security."
            ]
        },
        {
            title: "Suspension & Termination",
            content: [
                "We may suspend or terminate Accounts or access without notice for violations of these Terms, abuse, or legal reasons.",
                "On termination, some data may persist in backups for a period to comply with legal obligations or for fraud prevention."
            ]
        },
        {
            title: "Disclaimers",
            content: [
                "THE PLATFORM IS PROVIDED “AS IS.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, SALIMBIGKAS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
                "WE DO NOT WARRANT UNINTERRUPTED OR ERROR-FREE OPERATION, NOR GUARANTEE SPECIFIC EDUCATIONAL OUTCOMES."
            ]
        },
        {
            title: "Limitation of Liability",
            content: [
                "TO THE MAXIMUM EXTENT PERMITTED BY LAW, SALIMBIGKAS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES, OR FOR LOSS OF DATA, PROFITS, OR REPUTATION, ARISING OUT OF OR IN CONNECTION WITH THE PLATFORM."
            ]
        },
        {
            title: "Indemnification",
            content: [
                "You agree to indemnify and hold Salimbigkas harmless from claims arising from your violation of these Terms or your misuse of the Platform."
            ]
        },
        {
            title: "Changes to Terms",
            content: [
                "We may update these Terms. When significant changes occur, we’ll provide notice through the Teachers or Platform. Continued use after notice constitutes acceptance."
            ]
        },
        {
            title: "Governing Law & Dispute Resolution",
            content: [
                "These Terms are governed by the laws of the Republic of the Philippines. Disputes should first be attempted to be resolved informally. If unresolved, parties may pursue arbitration or courts of the Philippines."
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
                <h1 className="chalk-text text-8xl font-bold">Terms of Service</h1>
            </div>
            <div className="flex-1 w-full bg-[#F9FAFB]">
                <main className="flex flex-1 text-left max-w-[1440px] mx-auto">
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
                        <p className="text-xl">These Terms of Service (these “Terms”) govern your access to and use of the Salimbigkas E-Learning Platform (the “Platform”), provided by SYNERGY (“we”, “us”, or “Salimbigkas”). By accessing or using the Platform (including web and mobile apps), you agree to be bound by these Terms.</p>
                        {text.map((section, idx) => (
                            <div key={idx} id={`section-${idx}`} className="text-xl space-y-2 mt-4 mb-6 scroll-mt-25">
                                <h3 className="text-4xl font-bold">{`${idx + 1}. ${section.title}`}</h3>
                                <ul className="list-inside space-y-2">
                                    {section.content.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
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

export default TermsOfService;