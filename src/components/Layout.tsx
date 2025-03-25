import React from 'react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div>
            <header>
                <h1>Dashboard Header</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>Dashboard Footer</p>
            </footer>
        </div>
    );
};

export default Layout;