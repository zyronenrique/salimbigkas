import { useState } from "react";
import { imageSrc } from "../Icons/icons";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HeaderProps {
  openLoginModal: () => void;
  openHomePage: () => void;
  openAboutPage: () => void;
  openFeaturesPage: () => void;
  openContactPage: () => void;
}

const Header = ({
  openLoginModal,
  openHomePage,
  openAboutPage,
  openFeaturesPage,
  openContactPage,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? "auto" : "hidden";
  };

  const handleMenuClick = (action: () => void) => {
    action();
    toggleMobileMenu();
  };

  const listofmenu = (label: string, onClick: () => void) => (
    <div className="flex justify-center items-center w-full h-[100px] hover:bg-gray-200 hover:text-[#386BF6]">
      <button type="button" onClick={() => handleMenuClick(onClick)}>
        {label}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu */}
      <header
        className={`flex flex-col items-center justify-between w-full h-screen bg-white fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative py-5 w-full flex justify-center items-center border-b border-gray-200 shadow-sm">
          <button
            type="button"
            title="Close Menu"
            aria-label="Close Menu"
            className="absolute top-4 right-5 flex items-center px-3 py-2"
            onClick={toggleMobileMenu}
          >
            <X size={24} className="hover:text-gray-600" />
          </button>
          <img loading="lazy" src={imageSrc.salimbigkaslogo} alt="Salimbigkas Logo" className="w-40" />
        </div>
        <div className="flex flex-col justify-between w-full h-full text-lg font-semibold">
          {listofmenu("Home", openHomePage)}
          {listofmenu("About", openAboutPage)}
          {listofmenu("Features", openFeaturesPage)}
          {listofmenu("Contact", openContactPage)}
        </div>
        <div className="flex items-center justify-center w-full p-2">
          <button
            type="button"
            className="w-full text-black text-base px-4 py-5 rounded-lg border hover:border-[#e0f2f1] shadow-md drop-shadow-sm bg-none hover:bg-[#e0f2f1]"
            onClick={openLoginModal}
          >
            Mag-Login
          </button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="flex bg-white w-full px-20 py-4 justify-between">
        <div className="flex w-full gap-2 justify-baseline items-center">
          <button
            type="button"
            title="Menu"
            aria-label="Menu"
            className="xl:hidden flex items-center px-3 py-2"
            onClick={toggleMobileMenu}
          >
            <Menu size={24} />
          </button>
          <img loading="lazy" src={imageSrc.salimbigkaslogo} alt="Salimbigkas Logo" className="w-40" />
        </div>
        <div className="max-xl:hidden flex items-center justify-center w-full">
          <ul className="flex gap-10 text-sm font-semibold">
            <li>
              <a className="cursor-pointer" onClick={() => navigate("/")}>
                Home
              </a>
            </li>
            <li>
              <a className="cursor-pointer" onClick={() => {
                if (location.pathname !== "/about-us") {
                  navigate("/about-us");
                }
              }}>
                About
              </a>
            </li>
            <li>
              <a className="cursor-pointer" onClick={() => goToSection("features")}>
                Features
              </a>
            </li>
            <li>
              <a className="cursor-pointer" onClick={() => goToSection("contact")}>
                Contact
              </a>
            </li>
          </ul>
        </div>
        <div className="max-xl:hidden flex items-center justify-center w-full">
          <motion.button
            type="button"
            title="Login"
            className="ml-auto text-black text-base px-4 py-2 rounded-lg border hover:border-[#e0f2f1] shadow-md drop-shadow-lg bg-none hover:bg-[#e0f2f1]"
            onClick={openLoginModal}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mag-Login
          </motion.button>
        </div>
      </header>
    </>
  );
};

export default Header;
