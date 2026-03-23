import "./App.css";
import React from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";

import {
    Route,
    BrowserRouter as Router,
    Routes,
    useLocation,
    Navigate,
} from "react-router-dom";

import { ApplicationsProvider } from "./clients/RocknRolla/Applications/context/ApplicationsProvider";
import { FormProvider } from "./context/FormProvider.jsx";
// ── Client pages ──────────────────────────────────────────────────────────────
import RocknRollaApplications from "./clients/RocknRolla/Applications/ApplicationsPage.jsx";
import MundoVerdeInvoices from "./clients/MundoVerde/Invoices/InvoicesPage.jsx";
import FicohsaCalls from "./clients/Ficohsa/Calls/CallsPage.jsx";
import SpectrumLeads from "./clients/Spectrum/Leads/LeadsPage.jsx";
import PepsiVideoAnalysis from "./clients/Pepsi/VideoAnalysis/VideoAnalysisPage.jsx";
import RegistroProveedor from "./clients/MundoVerde/RegistroProveedor/RegistroProveedorPage.jsx";
// ── Garoo services ─────────────────────────────────────────────────────────────
import AgentOnboarding from "./Garoo/AgentOnboarding/AgentOnboardingPage.jsx";
import AdminPortal from "./Garoo/Admin/AdminPortal.jsx";
import Services from "./pages/Services.jsx";
import MyServices from "./pages/MyServices.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import Header from "./components/Layout/Header.jsx";

import { AuthProvider } from "./context/AuthContext";
import { ServicesProvider } from "./context/ServicesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";

function App() {
    return (
        <Router>
            <AuthProvider>
                <ServicesProvider>
                    <ApplicationsProvider>
                        <FormProvider>
                            <AppContent />
                        </FormProvider>
                    </ApplicationsProvider>
                </ServicesProvider>
            </AuthProvider>
        </Router>
    );
}

function AppContent() {
    const location = useLocation();
    const isLoginPage = location.pathname === "/login";
    const isPublicForm = location.pathname === "/outbound-call-form";
    const isRegistroProveedor = location.pathname === "/registro-proveedor";
    const noLayout = isLoginPage || isPublicForm || isRegistroProveedor;

    return (
        <>
            {!noLayout && <Header />}
            <div className={noLayout ? "" : "app-container"}>
                <main className={noLayout ? "" : "content"}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                         <Route
                            path="/services"
                            element={
                                <ProtectedRoute requiredRole="admin">
                                    <Services />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-services"
                            element={
                                <ProtectedRoute>
                                    <MyServices />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/applications"
                            element={
                                <ProtectedRoute serviceId="applications">
                                    <RocknRollaApplications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/form"
                            element={
                                <ProtectedRoute serviceId="form">
                                    <MundoVerdeInvoices />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/outbound-call-form"
                            element={<FicohsaCalls />}
                        />
                        <Route
                            path="/registro-proveedor"
                            element={<RegistroProveedor />}
                        />
                        <Route
                            path="/spectrum-leads"
                            element={
                                <ProtectedRoute serviceId="spectrum-leads">
                                    <SpectrumLeads />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/video-analysis"
                            element={
                                <ProtectedRoute serviceId="video-analysis">
                                    <PepsiVideoAnalysis />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/agent-onboarding"
                            element={
                                <ProtectedRoute serviceId="agent-onboarding">
                                    <AgentOnboarding />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin-portal"
                            element={
                                <ProtectedRoute serviceId="admin-portal">
                                    <AdminPortal />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </>
    );
}

export default App;
