import {NavLink, Outlet} from 'react-router-dom';
import {ChevronLeft, ChevronRight, Home, Users, LogOut} from 'lucide-react';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useState} from "react";


const AdminLayout = () => {
    const {logout} = useAuth();
    const [isOpen, setIsOpen] = useState(false);


    const navItems = [
        {to: '/admin', icon: Home, label: 'Dashboard'},
        {to: '/admin/members', icon: Users, label: 'Members'},
    ];

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Sidebar - very narrow on mobile */}
            <aside
                className={`
                        fixed inset-y-0 left-0 z-50
                        w-16 bg-blue-700
                        flex flex-col items-center py-6 space-y-8
                        transform transition-transform duration-300
                        ${isOpen ? "translate-x-0" : "-translate-x-full"}
                        lg:translate-x-0 shadow-gray-400 shadow-lg
    `}
            >
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsOpen(false)}
                        className={({isActive}) =>
                            `p-3 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-blue-800 text-white"
                                    : "text-blue-200 hover:bg-blue-600"
                            }`
                        }
                        title={item.label}
                    >
                        <item.icon className="w-6 h-6"/>
                    </NavLink>

                ))}

                <button
                    onClick={logout}
                    className="mt-auto p-3 text-blue-200 hover:bg-blue-600 rounded-lg transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-6 h-6"/>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10 lg:ml-16 overflow-x-hidden">
                <div onClick={() => setIsOpen(!isOpen)}
                     className={` h-10 text-white absolute fixed bg-blue-600 rounded-e-4xl top-2 ${isOpen ? "left-10 w-15" : "left-0 w-10"} transition-all duration-300`}>
                    <p className="absolute  right-1 top-2 transition-all transform duration-300 animate-pulse ">
                        {isOpen ? <ChevronLeft/> : <ChevronRight/>}</p>
                </div>


                <Outlet/>
            </main>
        </div>
    );
};

export default AdminLayout;