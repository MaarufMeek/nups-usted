import {Route, Routes} from 'react-router-dom';
import StudentForm from './components/StudentForm';

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminLogin from "./components/AdminLogin.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import AdminLayout from "./components/AdminLayout.tsx";
import DashboardHome from "./components/AdminHOme.tsx";
import MembersList from "./components/MemberList.tsx";

function App() {
    return (
        <>
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<StudentForm/>}/>

                {/* Admin Login */}
                <Route path="/admin-login" element={<AdminLogin/>}/>

                {/* Protected Admin Routes */}
                <Route element={<ProtectedRoute/>}>
                    <Route element={<AdminLayout/>}>
                        <Route path="/admin" element={<DashboardHome/>}/>
                        <Route path="/admin/members" element={<MembersList/>}/>
                    </Route>
                </Route>
            </Routes>

            <ToastContainer/>
        </>
    );
}

export default App;