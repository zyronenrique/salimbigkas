import { Facebook, Twitter, Instagram } from "lucide-react";
import { imageSrc } from "../Icons/icons";

const Footer = () => {
  return (
    <footer className="py-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="flex flex-col">
          <img loading="lazy" src={imageSrc.salimbigkaslogo} alt="Salimbigkas Logo" className="w-40 mb-4" />
          <p className="text-sm">
            Transforming Filipino language education through AI-powered
            learning.
          </p>
        </div>
        <div className="flex flex-col px-10">
          <h2 className="font-bold text-lg mb-2">Contact Us</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <span>Email: </span>
              <a
                href="mailto:salimbigkas@gmail.com"
                className="text-blue-400 hover:underline"
              >
                salimbigkas@gmail.com
              </a>
            </li>
            <li>
              <span>Phone: </span>
              <a
                href="tel:+639123456789"
                className="text-blue-400 hover:underline"
              >
                +63 912 345 6789
              </a>
            </li>
            {/* <li>
              <span>Address: </span>
              <a
                href="https://goo.gl/maps/xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                View on Google Maps
              </a>
            </li> */}
          </ul>
        </div>
        <div className="flex flex-col px-10">
          <h2 className="font-bold text-lg mb-2">Legal</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/tos" className="text-blue-400 hover:underline">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="/privacy" className="text-blue-400 hover:underline">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>
        {/* <div className="flex flex-col px-10">
          <h2 className="font-bold text-lg mb-2">Resources</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/faq" className="text-blue-400 hover:underline">
                FAQ
              </a>
            </li>
            <li>
              <a href="/support" className="text-blue-400 hover:underline">
                Support
              </a>
            </li>
          </ul>
        </div> */}
      </div>
      <div className="border-t border-gray-200 my-6 mt-20"></div>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm px-4 mt-15">
        <p>
          &copy; {new Date().getFullYear()} SalimBigkas Team. All rights
          reserved.
        </p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a
            title="Visit our facebook profile"
            href="https://www.facebook.com/profile.php?id=61580736158496"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 rounded-full p-1 bg-[#2C3E50]"
          >
            <Facebook color="white" className="w-6 h-6 inline-block" />
          </a>
          <a
            title="Visit our twitter profile"
            href="https://x.com/salimbigka_11"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 rounded-full p-1 bg-[#2C3E50]"
          >
            <Twitter color="white" className="w-5 h-5 inline-block" />
          </a>
          <a
            title="Visit our instagram profile"
            href="https://www.instagram.com/salimbigkas3/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 rounded-full p-1 bg-[#2C3E50]"
          >
            <Instagram color="white" className="w-5 h-5 inline-block" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
