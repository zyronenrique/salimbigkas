import { imageSrc } from "../components/Icons/icons";

const Characters = () => (
  <div className="absolute bottom-0 z-0 flex w-full items-center justify-between">
    <img
      src={imageSrc.bookgirl}
      alt="Character"
      className="hidden md:block h-[300px] object-contain"
    />
    <img
      src={imageSrc.colorboy}
      alt="Character"
      className="hidden md:block h-[300px] object-contain"
    />
  </div>
);

export default Characters;