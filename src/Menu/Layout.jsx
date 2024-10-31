import React from 'react';
import { useLocation } from 'react-router-dom';
import Menu from './Menu';

const Layout = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <div>
            {!isLoginPage && <Menu />}
            <main>
                {children}
            </main>
        </div>
    );
};

export default Layout;