import { useEffect } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { imageSrc } from "../components/Icons/icons";
import Header from "../components/HomePage/Header";
import Footer from "../components/HomePage/Footer";
import { useLocation, useNavigate, } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { useAuth } from "../hooks/authContext";
import AuthModal from "../components/Modals/AuthModal";
import { useLogReg } from "../components/Modals/LogRegProvider";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading } = useAuth();
  const { isLogin, isForgot, isModalOpen, openLoginModal, openRegisterModal, closeModal } = useLogReg();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

  return (
    <div className="flex flex-col mx-auto bg-[#F8F9FA]">
      <BarLoader
        color="#208ec5" 
        loading={loading}
        cssOverride={
          {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderColor: '#208ec5',
            top: 0,
            left: 0,
            margin: "0 auto",
            width: '100%',
            zIndex: 9999,
          }
        }
        speedMultiplier={0.8}
      />
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
      <div className="overflow-hidden w-full h-[600px]">
        <div className="max-w-[1440px] mx-auto flex h-full px-40 py-10 gap-10 justify-center items-center">
          <div className="flex flex-1 flex-col h-full text-left justify-center items-start">
            <h1 className="text-6xl leading-[5rem] font-semibold min-h-[10rem]">
              <TypeAnimation
                sequence={[
                  'Learn Filipino Easily with Salimbigkas',
                  2000,
                  'Matuto ng Filipino nang Madali sa Salimbigkas',
                  2000,
                  'Tuklasin ang Galing sa Wikang Filipino!',
                  2000,
                ]}
                wrapper="span"
                speed={80}
                repeat={Infinity}
                cursor={false}
              />
            </h1>
            <h2 className="w-xl mt-5 text-lg font-medium">
              <TypeAnimation
                sequence={[
                  1000,
                  'Interactive lessons. Fun quizzes. Built for young learners.',
                  2000,
                  'Mga interactive na aralin. Masayang quiz. Para sa mga batang mag-aaral.',
                  2000,
                  'Isang makabagong plataporma para sa batang mag-aaral.',
                  2000,
                ]}
                wrapper="span"
                speed={90}
                repeat={Infinity}
                cursor={false}
              />
            </h2>
            <div className="flex flex-col mt-10">
              <motion.button
                type="button"
                className="text-[#F8F9FA] px-12 py-4 rounded-lg bg-[#2C3E50] hover:bg-[#343f5f]"
                onClick={openRegisterModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-[1.2rem] font-bold">Start Learning</span>
              </motion.button>
              <h2 className="mt-5 mb-5 text-black font-bold">
                Don't have an account yet?
                <a
                  className="cursor-pointer hover:underline ml-1 font-semibold"
                  href="/register"
                  onClick={(e) => {
                    e.preventDefault();
                    openRegisterModal();
                  }}
                >
                  Register!
                </a>
              </h2>
            </div>
          </div>
          <div className="flex flex-1 h-full justify-center items-center">
            <img loading="lazy" src={imageSrc.salimbigkas} alt="Salimbigkas Logo" className="w-full h-[450px] rotate-20 object-contain" />
          </div>
        </div>
      </div>
      <div id="features" className="w-full">
        <div className="max-w-[1440px] mx-auto flex flex-col px-30 py-10 gap-5 justify-center items-center">
          <div className="flex flex-col text-center gap-5 py-10">
            <h1 className="text-3xl font-semibold">Why choose SalimBigkas?</h1>
            <h2 className=" text-gray-500 text-xl font-medium">
              Comprehensive learning tools designed for modern education
            </h2>
          </div>
          <div className="flex w-full py-30">
            <motion.div
              className="flex w-full justify-between items-center transition duration-300 ease-in-out hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <img loading="lazy" src={imageSrc.adaptiveLearning} alt="Adaptive Learning" className="h-[450px] mask-b-from-80% mask-b-to-100% object-contain" />
              <div className="flex flex-col text-left">
                <h2 className="mt-5 text-5xl font-bold">Adaptive Learning</h2>
                <p className="mt-5 text-xl text-gray-500">
                  Personalized learning paths for every child
                </p>
              </div>
            </motion.div>
          </div>
          <div className="flex w-full py-30">
            <motion.div
              className="flex w-full justify-between items-center transition duration-300 ease-in-out hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex flex-col text-left">
                <h2 className="mt-5 text-5xl font-bold">Lessons</h2>
                <p className="mt-5 text-xl text-gray-500">
                  Lessons aligned with K-12 Filipino curriculum
                </p>
              </div>
              <img loading="lazy" src={imageSrc.completeLesson} alt="Complete Lesson" className="h-[400px] mask-b-from-80% mask-b-to-100% object-contain" />
            </motion.div>
          </div>
          <div className="flex w-full py-40">
            <motion.div
              className="flex w-full justify-between items-center transition duration-300 ease-in-out hover:-translate-y-2"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <img loading="lazy" src={imageSrc.achievements} alt="Achievements" className="h-96 mask-x-from-80% mask-x-to-100% mask-y-from-80% mask-y-to-100% object-contain" />
              <div className="flex flex-col text-left">
                <h2 className="mt-5 text-5xl font-bold">Achievement Badges</h2>
                <p className="mt-5 text-xl text-gray-500">
                  Motivate kids through milestones
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="flex w-full pt-40">
          <motion.div
            className="flex w-full justify-between"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <img loading="lazy" src={imageSrc.anytime} alt="Anytime" className="h-[420px] mask-r-from-80% mask-r-to-100% mask-b-from-80% mask-b-to-100% object-contain" />
            <div className="flex flex-col text-left">
              <h2 className="mt-5 text-5xl font-bold">
                Anywhere, Anytime Access
              </h2>
              <p className="mt-5 text-xl text-gray-500">
                Learn via web or mobile
              </p>
            </div>
            <img loading="lazy" src={imageSrc.anywhere} alt="Anywhere" className="h-[420px] mask-b-from-80% mask-b-to-100% object-contain" />
          </motion.div>
        </div>
      </div>
      <div id="contact" className="w-full py-20">
        <div className="max-w-[1440px] mx-auto flex flex-col justify-center items-center h-full">
          <img loading="lazy" src={imageSrc.students} alt="Students" className="h-80 object-contain" />
          <h1 className="text-4xl font-bold mt-10">
            Ready to Transform Filipino Learning?
          </h1>
          <h2 className="mt-5 text-white/50 text-xl font-medium">
            Join the Salimbigkas Community
          </h2>
          <motion.button
            type="button"
            className="px-10 py-5 font-bold text-[#F8F9FA] rounded-lg bg-[#2C3E50] hover:bg-[#343f5f]"
            onClick={openRegisterModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Free
          </motion.button>
        </div>
      </div>
      <div className="w-full shadow-sm rounded-tl-4xl rounded-tr-4xl border border-gray-200">
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
  );
};

export default HomePage;
