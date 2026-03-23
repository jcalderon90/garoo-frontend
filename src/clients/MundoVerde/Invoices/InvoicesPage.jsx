import { useForm } from "react-hook-form";
import RB_Toast from "../../../components/RB_Toast";
import { useState, useEffect } from "react";
import { redtecInstance } from "../../../api/axios";
import { Spinner } from "react-bootstrap";
import RegistroProveedor from "../RegistroProveedor/RegistroProveedorPage";

const MundoVerdeInvoices = () => {
    const { register, handleSubmit, reset } = useForm({
        mode: "onChange",
        defaultValues: { nit: "", serie: "" },
    });

    const [pdfUrl, setPdfUrl] = useState(null);
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [xmlContent, setXmlContent] = useState(null);
    const [selectedXml, setSelectedXml] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Dashboard States
    const [activeTab, setActiveTab] = useState("form");
    const [invoices, setInvoices] = useState([]);
    const [isFetchingInvoices, setIsFetchingInvoices] = useState(false);
    const [filters, setFilters] = useState({ emisor: "", nit: "", from: "", to: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showToast, setShowToast] = useState(false);
    const [toastTitle, setToastTitle] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("");
    const [isPersistentToast, setIsPersistentToast] = useState(false);
    
    // UI Preview States
    const [showPdfPreview, setShowPdfPreview] = useState(true);
    const [showXmlPreview, setShowXmlPreview] = useState(false);

    const fetchInvoices = async (page = 1) => {
        setIsFetchingInvoices(true);
        try {
            const params = {
                page: page,
                pageSize: 10,
                ...filters
            };
            const response = await redtecInstance.get("facturas-sat", { params });
            const result = response.data;
            setInvoices(result.data || []);
            setTotalPages(result.meta?.totalPages || 1);
            setCurrentPage(result.meta?.page || page);
        } catch (error) {
            void error;
            setToastTitle("Error Historial");
            setToastMessage("No se pudieron cargar las facturas de SAT.");
            setToastVariant("danger");
            setShowToast(true);
        } finally {
            setIsFetchingInvoices(false);
        }
    };

    useEffect(() => {
        if (activeTab === "dashboard") fetchInvoices(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setIsPersistentToast(false);
        try {
            const pdfFile = data.pdf?.[0] || selectedPdf;
            const xmlFile = data.xml?.[0] || selectedXml;
            if (!pdfFile || !xmlFile || !data.nit || !data.serie) {
                setToastTitle("Campos Incompletos");
                setToastMessage("Completa todos los requerimientos.");
                setToastVariant("warning");
                setShowToast(true);
                return;
            }
            const formData = new FormData();
            formData.append("nit", data.nit.trim());
            formData.append("serie", data.serie.trim());
            formData.append("pdf", pdfFile, pdfFile.name);
            formData.append("xml", xmlFile, xmlFile.name);

            const response = await redtecInstance.post("facturas", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.data.status === "ok") {
                setToastTitle("Éxito");
                setToastMessage("Factura procesada correctamente.");
                setToastVariant("success");
                setIsPersistentToast(true);
                reset(); setPdfUrl(null); setSelectedPdf(null); setXmlContent(null); setSelectedXml(null);
            } else {
                setToastTitle("Enviado");
                setToastMessage("La solicitud se procesó correctamente");
                setToastVariant("success");
                setIsPersistentToast(true);
            }
            setShowToast(true);
        } catch (error) {
            void error;
            setToastTitle("Error");
            setToastMessage("Ocurrió un error al procesar.");
            setToastVariant("danger");
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setPdfUrl(URL.createObjectURL(file));
            setSelectedPdf(file);
        }
    };

    const handleXmlChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setXmlContent(event.target.result);
                setSelectedXml(file);
            };
            reader.readAsText(file, "UTF-8");
        }
    };


    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch (error) { void error; return dateStr; }
    };

    return (
        <div className="page-container animate-in orientation-wrapper">
            <style>{`
                /* LANDSCAPE ENFORCER */
                .orientation-blocker {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: #0f172a;
                    z-index: 10000;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    padding: 2.5rem;
                    text-align: center;
                }

                @media (max-width: 991px) and (orientation: portrait) {
                    .orientation-blocker { display: flex; }
                    .main-content-layout { display: none; }
                }

                /* HEADER & TABS SYMMETRY - COMPACT */
                .header-wrapper-v3 {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding: 0.5rem 1rem;
                    border-bottom: 1px solid #e2e8f0;
                    max-width: 1000px;
                    width: 100%;
                    margin-left: auto;
                    margin-right: auto;
                }

                .tabs-container-v3 {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 14px;
                    border: 1px solid #e2e8f0;
                }

                .tabs-container-v3 button {
                    border: none;
                    padding: 8px 18px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    color: #64748b;
                    background: transparent;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .tabs-container-v3 button.active-tab {
                    background: white;
                    color: #2563eb;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }

                /* GRID LAYOUT V4 - DYNAMIC & SYMMETRICAL */
                .layout-grid-v4 {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 1.5rem;
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    align-items: stretch; /* Empuja ambas columnas a la misma altura */
                }

                .pane-v3 {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }

                .preview-stack-v3 {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    height: 100%;
                }

                .preview-stack-v3 .pane-v3 {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }

                .pane-header-v3 {
                    padding: 0.6rem 1.25rem;
                    background: #f1f5f9;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-shrink: 0;
                }

                .pane-header-v3 span {
                    font-size: 0.6rem;
                    font-weight: 950;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #475569;
                }

                /* FORM STYLING REFINEMENT V4 */
                .form-shell-v4 {
                    padding: 1.5rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.25rem;
                }

                .full-width-v4 { grid-column: span 2; }

                .field-item-v3 { display: flex; flex-direction: column; gap: 6px; }
                .field-item-v3 label { 
                    font-size: 0.65rem; 
                    font-weight: 850; 
                    color: #64748b; 
                    text-transform: uppercase; 
                }
                .field-item-v3 input {
                    width: 100%;
                    background: #f1f5f9;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #1e293b;
                    outline: none;
                }
                .field-item-v3 input:focus { border-color: var(--primary); background: white; }

                /* FILE ZONE V4 - SYMMETRICAL */
                .file-zone-v4 {
                    background: #f8fafc;
                    border: 1.5px dashed #cbd5e1;
                    padding: 1rem;
                    border-radius: 12px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    text-align: center;
                    min-height: 100px;
                }
                .file-zone-v4:hover { border-color: var(--primary); background: #f1f5f9; }
                .file-zone-v4 i { font-size: 1.5rem; color: #94a3b8; }
                .file-zone-v4 p { margin: 0; font-size: 0.7rem; font-weight: 800; color: #475569; text-transform: uppercase; }
                .file-zone-v4 span { font-size: 0.55rem; color: #94a3b8; font-weight: 600; }
                .file-zone-v4.is-ready { border-color: #2563eb; background: #eff6ff; border-style: solid; }
                .file-zone-v4.is-ready i { color: #2563eb; }

                /* XML SHELL */
                .xml-shell-v3 {
                    background: #020617;
                    padding: 0.85rem;
                    flex: 1;
                    overflow: auto;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.65rem;
                    color: #94a3b8;
                    border-radius: 0 0 16px 16px;
                }

                /* DASHBOARD PREMIUM V3 */
                .dashboard-v3 {
                    background: white;
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    max-width: 1000px;
                    width: 100%;
                    margin: 0 auto;
                }

                .filter-bar-v3 {
                    display: flex;
                    gap: 0.75rem;
                    background: #fff;
                    padding: 0.85rem 1.25rem;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }

                .pagination-bar-v3 {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    padding: 0.6rem 1.25rem;
                    border-top: 1px solid #e2e8f0;
                    border-bottom: 1px solid #e2e8f0;
                }

                .filter-group-v3 { 
                    display: flex; 
                    flex-direction: column; 
                    gap: 6px; 
                    flex: 1; /* Los filtros ahora crecen para llenar el espacio */
                    min-width: 120px;
                }
                .filter-group-v3 label { 
                    font-size: 0.55rem; 
                    font-weight: 950; 
                    color: #94a3b8; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                    margin-bottom: 2px;
                }
                .filter-group-v3 input {
                    border: 1px solid #e2e8f0; 
                    border-radius: 8px; 
                    padding: 6px 12px; 
                    font-size: 0.75rem; 
                    font-weight: 700;
                    color: #1e293b;
                    background: #f8fafc;
                    transition: all 0.2s;
                    width: 100%;
                    height: 34px;
                }
                .filter-group-v3 input:focus { border-color: var(--primary); background: white; outline: none; }

                .btn-filter-v3 {
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 0 16px;
                    font-size: 0.75rem;
                    font-weight: 850;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    height: 34px;
                }
                .btn-filter-v3:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2); }

                /* TABLE STYLING */
                .table-v3 { width: 100%; border-collapse: separate; border-spacing: 0; }
                .table-v3 th {
                    background: #f8fafc; 
                    padding: 0.75rem 1.25rem; 
                    font-size: 0.65rem; 
                    font-weight: 950; 
                    text-transform: uppercase; 
                    color: #64748b;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #f1f5f9;
                }
                .table-v3 tr:hover td { background: #fbfcfe; }
                .table-v3 td { 
                    padding: 0.5rem 1.25rem; 
                    border-bottom: 1px solid #f1f5f9; 
                    vertical-align: middle; 
                    transition: background 0.2s;
                }

                .col-date-v3 { font-size: 0.75rem; font-weight: 800; color: #64748b; white-space: nowrap; }
                
                .emisor-wrapper-v3 { display: flex; flex-direction: column; gap: 2px; }
                .emisor-name-v3 { font-size: 0.8rem; font-weight: 900; color: #1e293b; line-height: 1.3; }
                .emisor-nit-v3 { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #94a3b8; font-weight: 700; }

                .serie-badge-v3 {
                    display: inline-flex;
                    padding: 4px 10px;
                    background: #eff6ff;
                    color: var(--primary);
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 950;
                    letter-spacing: 0.5px;
                }
                .dte-num-v3 { font-family: monospace; font-size: 0.65rem; color: #94a3b8; font-weight: 600; margin-top: 4px; display: block; }

                .amount-v3 { font-size: 0.9rem; font-weight: 950; color: #0f172a; }
                .amount-v3 span { font-size: 0.7rem; color: #94a3b8; font-weight: 800; margin-right: 4px; }

                .doc-actions-v3 { display: flex; gap: 10px; justify-content: flex-end; }
                .btn-doc-v3 {
                    width: 36px; height: 36px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    border: 1px solid #e2e8f0;
                    background: white;
                    color: #475569;
                    font-size: 1.1rem;
                    transition: all 0.2s;
                    text-decoration: none;
                }
                .btn-doc-v3:hover { transform: scale(1.05); }
                .btn-doc-v3.is-pdf:hover { border-color: #f87171; color: #ef4444; background: #fef2f2; }
                .btn-doc-v3.is-xml:hover { border-color: #60a5fa; color: #3b82f6; background: #eff6ff; }

                /* PAGINATION COMPACT */
                .pagination-compact-v3 {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    height: 32px;
                }
                .pagination-info-v3 { 
                    font-size: 0.65rem; 
                    font-weight: 950; 
                    color: #475569; 
                    text-transform: uppercase; 
                    letter-spacing: 0.5px;
                    background: #fff;
                    padding: 4px 10px;
                    border-radius: 6px;
                    border: 1px solid #e2e8f0;
                }
                .pagination-nav-v3 { display: flex; gap: 6px; }
                .nav-btn-v3 {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    border: 1px solid #cbd5e1;
                    background: white;
                    color: var(--primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }
                .nav-btn-v3:hover:not(:disabled) { 
                    border-color: var(--primary); 
                    background: var(--primary); 
                    color: white;
                    box-shadow: 0 4px 8px rgba(37, 99, 235, 0.15);
                }
                .nav-btn-v3:disabled { opacity: 0.2; cursor: not-allowed; color: #94a3b8; border-color: #e2e8f0; }

                @media (max-width: 1200px) { .layout-grid-v4 { grid-template-columns: 1fr; height: auto; } }

                /* TOGGLE SWITCH CUSTOM */
                .form-check-input:checked {
                    background-color: #2563eb;
                    border-color: #2563eb;
                }
                .switch-label-v4 {
                    font-size: 0.6rem;
                    font-weight: 800;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            `}</style>

            {/* Portrait Blocker */}
            <div className="orientation-blocker">
                <i className="bi bi-phone-landscape mb-4" style={{ fontSize: '4rem', color: 'var(--primary)' }}></i>
                <h2 className="fw-950 mb-2">Modo Horizontal Requerido</h2>
                <p className="opacity-75">Gira tu dispositivo para acceder al portal de facturación.</p>
            </div>

            <div className="main-content-layout p-2">
                <div className="header-wrapper-v3">
                    <div className="d-flex align-items-center gap-3">
                        <h1 className="fw-950 m-0" style={{ fontSize: '1.5rem', color: '#0f172a', letterSpacing: '-0.5px' }}>Facturación</h1>
                        <div className="d-flex flex-column" style={{ borderLeft: '2px solid #e2e8f0', paddingLeft: '15px' }}>
                            <span className="fw-900" style={{ fontSize: '0.6rem', letterSpacing: '1px', textTransform: 'uppercase', color: '#2563eb' }}>Mundo Verde</span>
                            <span className="text-muted fw-700" style={{ fontSize: '0.55rem' }}>Gestión Operativa</span>
                        </div>
                    </div>
                    <div className="tabs-container-v3">
                        <button className={activeTab === 'form' ? 'active-tab px-3' : 'px-3'} onClick={() => setActiveTab('form')}>
                            <i className="bi bi-plus-lg"></i> Nueva Factura
                        </button>
                        <button className={activeTab === 'dashboard' ? 'active-tab px-3' : 'px-3'} onClick={() => setActiveTab('dashboard')}>
                            <i className="bi bi-history"></i> Historial SAT
                        </button>
                        <button className={activeTab === 'proveedor' ? 'active-tab px-3' : 'px-3'} onClick={() => setActiveTab('proveedor')}>
                            <i className="bi bi-building-add"></i> Reg. Proveedor
                        </button>
                    </div>
                </div>

                {activeTab === 'proveedor' ? (
                    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 1rem' }}>
                        <RegistroProveedor embedded />
                    </div>
                ) : activeTab === 'form' ? (
                    <div className="layout-grid-v4">
                        <div className="preview-stack-v3">
                            {showPdfPreview && (
                                <div className={`pane-v3 ${!showXmlPreview ? 'h-100' : ''}`} style={{ flex: showXmlPreview ? '1' : 'none' }}>
                                    <div className="pane-header-v3">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                                            <span>Visor de Documento</span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1" style={{ background: '#f1f5f9', minHeight: '400px' }}>
                                        {pdfUrl ? <iframe src={pdfUrl} width="100%" height="100%" title="PDF" style={{ border: 'none', display: 'block' }} /> : 
                                        <div className="d-flex flex-column align-items-center justify-content-center h-100 opacity-20">
                                            <i className="bi bi-file-earmark-pdf" style={{ fontSize: '3rem' }}></i>
                                            <span className="fw-950 x-small mt-3">VISTA PREVIA PDF</span>
                                        </div>}
                                    </div>
                                </div>
                            )}
                            
                            {showXmlPreview && (
                                <div className="pane-v3 animate-in" style={{ height: '220px', marginTop: showPdfPreview ? '1rem' : '0' }}>
                                    <div className="pane-header-v3">
                                        <span><i className="bi bi-code-square text-primary me-2"></i> Estructura de Datos (XML)</span>
                                    </div>
                                    <div className="xml-shell-v3">
                                        {xmlContent ? <pre className="m-0">{xmlContent}</pre> : 
                                        <div className="d-flex align-items-center justify-content-center h-100 opacity-20 fw-950 x-small">ESTRUCTURA SIN CARGAR</div>}
                                    </div>
                                </div>
                            )}

                            {!showPdfPreview && !showXmlPreview && (
                                <div className="pane-v3 h-100 d-flex flex-column align-items-center justify-content-center opacity-20">
                                    <i className="bi bi-eye-slash" style={{ fontSize: '3.5rem' }}></i>
                                    <span className="fw-950 x-small mt-3">VISTAS PREVIAS DESACTIVADAS</span>
                                </div>
                            )}
                        </div>

                        <div className="preview-stack-v3">
                            <form className="pane-v3" style={{ background: 'white' }} onSubmit={handleSubmit(onSubmit)}>
                                <div className="pane-header-v3"><span><i className="bi bi-send-fill text-primary me-2"></i> Datos de Envío</span></div>
                                <div className="form-shell-v4">
                                    <div className="field-item-v3">
                                        <label>NIT del Emisor</label>
                                        <input {...register("nit", { required: true })} placeholder="1234567-k" />
                                    </div>
                                    <div className="field-item-v3">
                                        <label>Serie / Correlativo</label>
                                        <input {...register("serie", { required: true })} placeholder="A-9988" />
                                    </div>
                                    
                                    <div className="full-width-v4 mt-3">
                                        <p className="fw-950 text-muted mb-3" style={{ fontSize: '0.65rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Documentos de Soporte</p>
                                        <div className="d-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className="d-flex flex-column gap-2">
                                                <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
                                                    <input 
                                                        className="form-check-input m-0 cursor-pointer" 
                                                        type="checkbox" 
                                                        id="pdfToggle"
                                                        checked={showPdfPreview}
                                                        onChange={() => setShowPdfPreview(!showPdfPreview)}
                                                    />
                                                    <label className="switch-label-v4 cursor-pointer m-0" htmlFor="pdfToggle">Vista PDF</label>
                                                </div>
                                                <label className={`file-zone-v4 ${selectedPdf ? 'is-ready' : ''}`}>
                                                    <input type="file" accept=".pdf" hidden {...register("pdf", { required: true, onChange: handlePdfChange })} />
                                                    <i className={`bi ${selectedPdf ? 'bi-file-earmark-check-fill' : 'bi-file-earmark-pdf'}`}></i>
                                                    <p>{selectedPdf ? 'PDF Listo' : 'PDF'}</p>
                                                    <span>Subir archivo</span>
                                                </label>
                                            </div>

                                            <div className="d-flex flex-column gap-2">
                                                <div className="form-check form-switch d-flex align-items-center gap-2 m-0 p-0">
                                                    <input 
                                                        className="form-check-input m-0 cursor-pointer" 
                                                        type="checkbox" 
                                                        id="xmlToggle"
                                                        checked={showXmlPreview}
                                                        onChange={() => setShowXmlPreview(!showXmlPreview)}
                                                    />
                                                    <label className="switch-label-v4 cursor-pointer m-0" htmlFor="xmlToggle">Vista XML</label>
                                                </div>
                                                <label className={`file-zone-v4 ${selectedXml ? 'is-ready' : ''}`}>
                                                    <input type="file" accept=".xml" hidden {...register("xml", { required: true, onChange: handleXmlChange })} />
                                                    <i className={`bi ${selectedXml ? 'bi-file-earmark-code-fill' : 'bi-filetype-xml'}`}></i>
                                                    <p>{selectedXml ? 'XML Listo' : 'XML'}</p>
                                                    <span>Sincronizar Datos</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="full-width-v4 mt-4 text-center">
                                        <button type="submit" className="btn-modern-primary w-100 py-3 justify-content-center" disabled={isLoading}>
                                            {isLoading ? <Spinner animation="border" size="sm" /> : <><i className="bi bi-send-plus-fill me-2"></i> Enviar Factura</>}
                                        </button>
                                        <p className="text-muted mt-3 mb-0" style={{ fontSize: '0.6rem', fontWeight: 600 }}>
                                            Validado por sistema de gestión Mundo Verde
                                        </p>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="dashboard-v3">
                         <div className="filter-bar-v3">
                            <div className="filter-group-v3">
                                <label>Emisor</label>
                                <input name="emisor" value={filters.emisor} onChange={handleFilterChange} placeholder="Buscar por nombre..." />
                            </div>
                            <div className="filter-group-v3">
                                <label>NIT</label>
                                <input name="nit" value={filters.nit} onChange={handleFilterChange} placeholder="NIT..." />
                            </div>
                            <div className="filter-group-v3">
                                <label>Desde</label>
                                <input type="date" name="from" value={filters.from} onChange={handleFilterChange} />
                            </div>
                            <div className="filter-group-v3">
                                <label>Hasta</label>
                                <input type="date" name="to" value={filters.to} onChange={handleFilterChange} />
                            </div>
                            <button className="btn-filter-v3" onClick={() => fetchInvoices(1)} disabled={isFetchingInvoices}>
                                {isFetchingInvoices ? <Spinner animation="border" size="sm" /> : <><i className="bi bi-search"></i> Filtrar</>}
                            </button>
                        </div>

                        <div className="pagination-bar-v3">
                            <div className="pagination-compact-v3">
                                <span className="pagination-info-v3 text-nowrap">Pág {currentPage} de {totalPages}</span>
                                <div className="pagination-nav-v3">
                                    <button 
                                        className="nav-btn-v3" 
                                        disabled={currentPage === 1 || isFetchingInvoices}
                                        onClick={() => fetchInvoices(1)}
                                        title="Primera página"
                                    >
                                        <i className="bi bi-chevron-double-left"></i>
                                    </button>
                                    <button 
                                        className="nav-btn-v3" 
                                        disabled={currentPage === 1 || isFetchingInvoices}
                                        onClick={() => fetchInvoices(currentPage - 1)}
                                        title="Página anterior"
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                    <button 
                                        className="nav-btn-v3" 
                                        disabled={currentPage === totalPages || isFetchingInvoices}
                                        onClick={() => fetchInvoices(currentPage + 1)}
                                        title="Siguiente página"
                                    >
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                    <button 
                                        className="nav-btn-v3" 
                                        disabled={currentPage === totalPages || isFetchingInvoices}
                                        onClick={() => fetchInvoices(totalPages)}
                                        title="Última página"
                                    >
                                        <i className="bi bi-chevron-double-right"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-auto pb-3">
                            <table className="table-v3">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>Fecha</th>
                                        <th>Emisor</th>
                                        <th style={{ width: '160px' }}>Serie / DTE</th>
                                        <th style={{ width: '150px' }}>Monto</th>
                                        <th className="text-end">Documentos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.length > 0 ? invoices.map((inv, i) => (
                                        <tr key={i}>
                                            <td className="col-date-v3">{formatDate(inv.fecha_emision)}</td>
                                            <td>
                                                <div className="emisor-wrapper-v3">
                                                    <span className="emisor-name-v3 text-uppercase">{inv.emisor_nombre}</span>
                                                    <span className="emisor-nit-v3">NIT: {inv.emisor_nit}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column align-items-start">
                                                    <span className="serie-badge-v3">{inv.serie}</span>
                                                    <span className="dte-num-v3">{inv.numero_dte}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="amount-v3">
                                                    <span>{inv.moneda}</span>
                                                    {new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2 }).format(inv.monto_total)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="doc-actions-v3">
                                                    {inv.files_url?.pdfLink && (
                                                        <a href={inv.files_url.pdfLink} target="_blank" rel="noreferrer" className="btn-doc-v3 is-pdf" title="Descargar PDF">
                                                            <i className="bi bi-file-earmark-pdf-fill"></i>
                                                        </a>
                                                    )}
                                                    {inv.files_url?.xmlLink && (
                                                        <a href={inv.files_url.xmlLink} target="_blank" rel="noreferrer" className="btn-doc-v3 is-xml" title="Descargar XML">
                                                            <i className="bi bi-filetype-xml"></i>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="5" className="text-center py-5 opacity-40 fw-950 fs-7">NO HAY FACTURAS DISPONIBLES</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <RB_Toast
                showToast={showToast}
                onClose={() => setShowToast(false)}
                toastVariant={toastVariant}
                toastTitle={toastTitle}
                toastMessage={toastMessage}
                position="middle-center"
                custom_autohide={!isPersistentToast}
                showOkButton={isPersistentToast}
            />
        </div>
    );
};

export default MundoVerdeInvoices;
