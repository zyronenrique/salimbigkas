import Header from "./Header";
import Footer from "./Footer";
import { useLocation, useNavigate } from "react-router-dom";
import AuthModal from "../Modals/AuthModal";
import { useLogReg } from "../Modals/LogRegProvider";

const AboutUs = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLogin, isForgot, isModalOpen, openLoginModal, openRegisterModal, closeModal } = useLogReg();

    const text = [
        {
            title: "Who We Are",
            content: [
                "Salimbigkas is an AI-powered e-learning platform designed to help elementary students master the Filipino language in a fun, structured, and interactive way. Developed by a team of passionate college students as part of a capstone project, Salimbigkas combines modern technology with traditional learning values to bridge gaps in Filipino language education.",
            ]
        },
        {
            title: "Our Mission",
            content: [
                "To make Filipino language learning engaging, accessible, and effective for young learners by integrating adaptive AI technologies, interactive lessons, and real-time progress tracking."
            ]
        },
        {
            title: "Our Vision",
            content: [
                "To be a trusted and innovative e-learning platform that empowers students, supports teachers, and involves parents in nurturing a strong foundation in Filipino proficiency for the next generation.",
            ]
        },
        {
            title: "What We Do",
            content: [
                "For Students: Provide interactive lessons, AI-generated quizzes, and personalized learning paths.",
                "For Teachers: Offer tools to create, assign, and unlock lessons while tracking student progress.",
                "For Parents: Enable visibility into their child’s progress and areas for improvement.",
                "For Schools: Deliver a scalable and modern approach to Filipino education aligned with the K-12 curriculum.",
            ]
        },
        {
            title: "Our Values",
            content: [
                "Innovation: Using AI and technology responsibly to improve learning.",
                "Accessibility: Ensuring learning tools are simple, child-friendly, and inclusive.",
                "Collaboration: Involving teachers, parents, and students in the learning journey.",
                "Excellence: Striving for quality and accuracy in every lesson, quiz, and feature we provide.",
            ]
        },
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
                <h1 className="chalk-text text-8xl font-bold">About Us</h1>
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
                    <div className="flex flex-3 flex-col gap-4 py-15 mr-40">
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
            <div className="flex-1 w-full bg-[#2C3E50] text-white">
                <div className="flex-1 max-w-[1440px] mx-auto p-30 flex flex-col gap-4 justify-center">
                    <h1 className="chalk-text text-6xl text-left font-bold">Team Behind Salimbigkas</h1>
                    <p className="text-xl text-left">Salimbigkas is the result of the hard work, dedication, and collaboration of a team of four college students who share a passion for education, technology, and innovation. Each member brought unique skills and perspectives to ensure the project was developed with both technical excellence and real-world usability.</p>
                </div>
            </div>
            <div className="flex-1 w-full">
                <div className="flex-1 max-w-[1440px] mx-auto px-50 py-30 flex flex-col gap-4 items-center justify-center">
                    <h1 className="text-4xl font-bold">Why We Built This</h1>
                    <p className="text-xl">As students ourselves, we understand the challenges of learning Filipino effectively. Our team created Salimbigkas not just as a capstone requirement, but as a meaningful contribution to modern Filipino education. We aim to empower learners, support teachers, and provide parents with the right tools to guide their children’s journey.</p>
                </div>
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

export default AboutUs;