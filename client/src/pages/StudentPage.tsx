import { Outlet, useLocation } from 'react-router-dom';
import Characters from './Characters';
import Header from './Header';
import { BarLoader } from 'react-spinners';
import { useAuth } from '../hooks/authContext';
import { imageSrc } from '../components/Icons/icons';

const StudentPage = () => {
    const location = useLocation();
    const { loading } = useAuth();
    const hideCharacters = /\/bigkas\/[^/]+\/(easy|normal|hard(\/[^/]*)?|leaderboard)/.test(location.pathname);
    return (
        <div className='flex-1 h-screen bg-[#F8F8F8]'>
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
            <Header />
            <img
                loading="lazy"
                src={imageSrc.lessonbg}
                alt="Lesson Background"
                className="hidden md:block absolute top-0 left-0 inset-0 w-full h-screen object-cover z-0 opacity-10"
            />
            <Outlet />
            {!hideCharacters && (
                <div className='opacity-40'>
                    <Characters />
                </div>
            )}
        </div>
    );
};

export default StudentPage