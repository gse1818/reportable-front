import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../../assets/images/logo.png";
import useMe from '../../apis/hook/useMe';
import { logout } from '../../apis/user';

const Header = ({ className }) => {
    const { me, isLoadingMe } = useMe();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.reload();
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    if (isLoadingMe) {
        return <div>Loading...</div>; // 로딩 상태 처리
    }

    return (
        <div
            className={
                "z-50 bg-white border-solid border-[#dddddd] border-b pt-3.5 pr-[18px] pb-3.5 pl-[18px] flex flex-row gap-2.5 items-center justify-between h-[104px] w-full overflow-hidden " +
                (className ? className : "")
            }
        >
            <div className="flex flex-row items-center justify-between w-full relative">
                <Link
                    className="flex flex-row items-center justify-between w-[523px] relative"
                    to="/"
                >
                    <div className="w-[259px] h-[74px] relative">
                        <img
                            className="w-[100%] h-[100%] absolute right-[0%] left-[0%] bottom-[0%] top-[0%]"
                            style={{ objectFit: "cover" }}
                            src={logo}
                            alt="Logo"
                        />
                    </div>
                    <div className="flex flex-row gap-[52px] items-start justify-start relative">
                        <button className="button-text">Service</button>
                        <button className="button-text">Contents</button>
                    </div>
                </Link>
                <div className="flex flex-row gap-5 items-center justify-start shrink-0 relative">
                    {me ? (
                        <>
                            <div className="flex flex-row gap-6 items-center">
                            <button
                                className="button bg-[#131313] text-[#FFFFFF]"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                            <div className="flex flex-row gap-2 items-center pr-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                                <path d="M28 16C28 18.1217 27.1571 20.1566 25.6569 21.6569C24.1566 23.1571 22.1217 24 20 24C17.8783 24 15.8434 23.1571 14.3431 21.6569C12.8429 20.1566 12 18.1217 12 16C12 13.8783 12.8429 11.8434 14.3431 10.3431C15.8434 8.84285 17.8783 8 20 8C22.1217 8 24.1566 8.84285 25.6569 10.3431C27.1571 11.8434 28 13.8783 28 16Z" fill="black"/>
                                <path fillRule="evenodd" clipRule="evenodd" d="M19.184 39.984C8.517 39.556 0 30.772 0 20C0 8.954 8.954 0 20 0C31.046 0 40 8.954 40 20C40 31.046 31.046 40 20 40H19.726C19.5447 40 19.364 39.9947 19.184 39.984ZM7.166 32.62C7.01646 32.1906 6.96557 31.733 7.01708 31.2812C7.0686 30.8294 7.22121 30.395 7.46358 30.0103C7.70595 29.6255 8.03186 29.3003 8.41712 29.0588C8.80238 28.8172 9.2371 28.6655 9.689 28.615C17.485 27.752 22.563 27.83 30.321 28.633C30.7735 28.6801 31.2093 28.8299 31.5952 29.0709C31.9811 29.3119 32.3068 29.6378 32.5477 30.0237C32.7886 30.4096 32.9383 30.8455 32.9853 31.298C33.0323 31.7505 32.9754 32.2078 32.819 32.635C36.1441 29.271 38.0062 24.73 38 20C38 10.059 29.941 2 20 2C10.059 2 2 10.059 2 20C2 24.916 3.971 29.372 7.166 32.62Z" fill="black"/>
                            </svg>
                            <span className="text-[#131313]">{me.name} 님</span>
                            </div>
                        </div>
                        </>
                    ) : (
                        <>
                            <Link
                                className="button text-[#131313] border border-neutral-900"
                                to="/signup"
                            >
                                Sign Up
                            </Link>
                            <Link
                                className="button bg-[#131313] text-[#FFFFFF]"
                                to="/signin"
                            >
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
