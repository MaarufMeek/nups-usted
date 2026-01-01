import {NavLink, Outlet} from 'react-router-dom';
import {ChevronLeft, ChevronRight, Home, Users, LogOut, Download} from 'lucide-react';
import {useAuth} from "../contexts/AuthContext.tsx";
import {useState} from "react";
import api from "../apiConfig.ts";


const AdminLayout = () => {
    const {logout, user} = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const navItems = [
        {to: '/admin', icon: Home, label: 'Dashboard'},
        {to: '/admin/members', icon: Users, label: 'Members'},
    ];

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            const response = await api.get('/backup/', {
                responseType: 'blob', // Important for file downloads
                timeout: 120000, // 2 minutes timeout for large backups
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'nups_backup.sql';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }
            
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            console.error('Backup failed:', error);
            alert('Failed to create backup. Please try again.');
        } finally {
            setIsBackingUp(false);
        }
    };

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
                        className="p-1 text-blue-200 hover:bg-blue-600 rounded-lg transition-colors flex flex-col items-center"
                        title={item.label}
                    >
                        <item.icon className="w-6 h-6 text-yellow-300"/>
                        <span className="text-[10px] mt-1">{item.label}</span>
                    </NavLink>
                ))}

                { user?.is_superuser && <button
                    onClick={handleBackup}
                    disabled={isBackingUp}
                    className="p-1 text-blue-200 hover:bg-blue-600 rounded-lg transition-colors flex flex-col items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isBackingUp ? "Creating backup..." : "Download Database Backup"}
                >
                    <Download className={`w-6 h-6 text-yellow-300 ${isBackingUp ? 'animate-pulse' : ''}`}/>
                    <span className="text-[10px] mt-1">{isBackingUp ? 'Backing up...' : 'Backup'}</span>
                </button>}

                <button
                    onClick={logout}
                    className="mt-auto p-1 text-blue-200 hover:bg-blue-600 rounded-lg transition-colors flex flex-col items-center"
                    title="Logout"
                >
                    <LogOut className="w-6 h-6 text-yellow-300"/>
                    <span className="text-[10px] mt-1">Logout</span>
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