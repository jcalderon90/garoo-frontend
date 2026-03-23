import { useState, useRef, useCallback } from "react";
import { Spinner } from "react-bootstrap";
import { redtecInstance } from "../../../api/axios";

const ENDPOINT = "registro-proveedor";
const INITIAL_FORM = { nit: "", nombre: "", direccion: "", correo: "", telefono: "" };

export default function RegistroProveedorPage({ embedded = false }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [pdfFile, setPdfFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [status, setStatus] = useState("idle");
    const [message, setMessage] = useState("");
    const fileRef = useRef(null);

    const handleChange = useCallback(e => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
    }, []);

    const handleFileSelect = useCallback(file => {
        if (!file) return;
        const validTypes = ["application/pdf", "image/png", "image/jpeg"];
        const validExt = /\.(pdf|png|jpg|jpeg)$/i.test(file.name);
        if (!validTypes.includes(file.type) && !validExt) {
            setStatus("error"); setMessage("Solo se aceptan archivos PDF, PNG o JPEG."); return;
        }
        if (file.size > 15 * 1024 * 1024) {
            setStatus("error"); setMessage("El archivo no debe superar 15 MB."); return;
        }
        setPdfFile(file);
        if (status === "error") setStatus("idle");
    }, [status]);

    const handleDrop = e => {
        e.preventDefault(); setDragOver(false);
        handleFileSelect(e.dataTransfer.files[0]);
    };

    const removeFile = e => {
        e.stopPropagation(); setPdfFile(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setStatus("loading"); setMessage("");
        console.log("Iniciando envío de registro de proveedor...");
        try {
            const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
            const fd = new FormData();
            Object.entries(trimmed).forEach(([k, v]) => { if (v) fd.append(k, v); });
            if (pdfFile) {
                console.log("Adjuntando archivo:", pdfFile.name, pdfFile.type, pdfFile.size);
                fd.append("archivo", pdfFile);
            }
            console.log("Datos de formulario:", trimmed);
            const response = await redtecInstance.post(ENDPOINT, fd, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            console.log("Respuesta del servidor:", response.data);
            setStatus("success");
            setMessage(response.data.mensaje || "¡Solicitud enviada! El proveedor será registrado en breve.");
            setForm(INITIAL_FORM); setPdfFile(null);
            if (fileRef.current) fileRef.current.value = "";
        } catch (error) {
            console.error("Error en registro de proveedor:", error);
            let errMsg = "No se pudo conectar. Verifica tu conexión e intenta de nuevo.";
            if (error.response) {
                errMsg = error.response.data?.error || error.response.data?.mensaje || `Error del servidor (${error.response.status})`;
            } else if (error.request) {
                errMsg = "El servidor no responde. Intenta más tarde.";
            }
            setStatus("error");
            setMessage(errMsg);
        }
    };

    const isLoading = status === "loading";
    const canSubmit = pdfFile || (form.nit.trim() && form.correo.trim());

    const content = (
        <>
            <style>{`
                /* ── REGISTRO PROVEEDOR – mismo design system que InvoicesPage ── */

                .rp-grid {
                    display: grid;
                    grid-template-columns: 1.2fr 1fr;
                    gap: 1.5rem;
                    width: 100%;
                    align-items: stretch;
                }

                /* Left pane: campos del formulario */
                .rp-fields-pane {
                    display: flex;
                    flex-direction: column;
                }

                /* Right pane: upload + acciones */
                .rp-actions-pane {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                /* ── Field item (idéntico a field-item-v3, compacto) ── */
                .rp-field { display: flex; flex-direction: column; gap: 4px; }
                .rp-field label {
                    font-size: 0.6rem;
                    font-weight: 850;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                }
                .rp-field label .req { color: #ef4444; margin-left: 2px; }
                .rp-field input {
                    width: 100%;
                    background: #f1f5f9;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 7px 10px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    color: #1e293b;
                    outline: none;
                    transition: all 0.2s;
                    height: 34px;
                }
                .rp-field input:focus {
                    border-color: var(--primary, #2563eb);
                    background: white;
                    box-shadow: 0 0 0 3px rgba(37,99,235,0.08);
                }
                .rp-field .rp-hint {
                    font-size: 0.57rem;
                    color: #94a3b8;
                    font-weight: 600;
                    margin: 0;
                }

                /* ── Inner form shell: 3 columns para compactar los campos ── */
                .rp-form-shell {
                    padding: 1rem 1.25rem;
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 0.75rem;
                    flex: 1;
                    align-content: start;
                }
                .rp-span2 { grid-column: span 2; }
                .rp-span3 { grid-column: span 3; }

                /* ── File zone (idéntico a file-zone-v4) ── */
                .rp-file-zone {
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
                    flex: 1;
                    min-height: 140px;
                }
                .rp-file-zone:hover { border-color: var(--primary, #2563eb); background: #f1f5f9; }
                .rp-file-zone.drag-over { border-color: var(--primary, #2563eb); background: #eff6ff; }
                .rp-file-zone.is-ready { border-color: #2563eb; background: #eff6ff; border-style: solid; }
                .rp-file-zone i { font-size: 1.5rem; color: #94a3b8; }
                .rp-file-zone.is-ready i { color: #2563eb; }
                .rp-file-zone p { margin: 0; font-size: 0.7rem; font-weight: 800; color: #475569; text-transform: uppercase; }
                .rp-file-zone .rp-sub { font-size: 0.55rem; color: #94a3b8; font-weight: 600; }

                /* ── File chip ── */
                .rp-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 20px;
                    padding: 4px 12px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    color: #1d4ed8;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    cursor: pointer;
                    transition: all 0.2s;
                    max-width: 90%;
                    margin-top: 4px;
                }
                .rp-chip:hover { background: #dbeafe; }
                .rp-chip .x { color: #94a3b8; }

                /* ── AI hint ── */
                .rp-ai-hint {
                    font-size: 0.6rem;
                    font-weight: 700;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    margin: 0;
                }
                .rp-ai-hint.on { color: #2563eb; }

                /* ── Status banners ── */
                .rp-banner {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .rp-banner.ok  { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
                .rp-banner.err { background: #fef2f2; border: 1px solid #fca5a5; color: #991b1b; }

                /* ── Footer note ── */
                .rp-footer-note {
                    font-size: 0.6rem;
                    font-weight: 600;
                    color: #94a3b8;
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin: 0;
                    text-align: center;
                }

                /* ── Responsive ── */
                @media (max-width: 1200px) {
                    .rp-grid { grid-template-columns: 1fr; }
                    .rp-actions-pane { height: auto; }
                    .rp-file-zone { min-height: 100px; }
                }
                @media (max-width: 768px) {
                    .rp-form-shell { grid-template-columns: 1fr 1fr; }
                    .rp-span2 { grid-column: span 2; }
                    .rp-span3 { grid-column: span 2; }
                }
                @media (max-width: 480px) {
                    .rp-form-shell { grid-template-columns: 1fr; }
                    .rp-span2, .rp-span3 { grid-column: span 1; }
                }
            `}</style>

            <div className="rp-grid">
                {/* ── LEFT: form fields ── */}
                <form className="pane-v3 rp-fields-pane" style={{ background: "white" }} onSubmit={handleSubmit}>
                    <div className="pane-header-v3">
                        <span><i className="bi bi-building-add text-primary me-2"></i>Datos del Proveedor</span>
                    </div>

                    <div className="rp-form-shell">
                        {/* Fila 1 – Identificación: NIT | Razón Social (más ancha) */}
                        <div className="rp-field">
                            <label>NIT<span className="req">*</span></label>
                            <input name="nit" value={form.nit} onChange={handleChange}
                                placeholder="123456-7" required={!pdfFile} />
                            <p className="rp-hint">Con o sin guion.</p>
                        </div>
                        <div className="rp-field rp-span2">
                            <label>Razón Social / Nombre</label>
                            <input name="nombre" value={form.nombre} onChange={handleChange}
                                placeholder="Empresa Ejemplo S.A." />
                        </div>

                        {/* Fila 2 – Contacto: Correo (más ancho) | Teléfono */}
                        <div className="rp-field rp-span2">
                            <label>Correo Electrónico<span className="req">*</span></label>
                            <input name="correo" type="email" value={form.correo} onChange={handleChange}
                                placeholder="contacto@empresa.com" required={!pdfFile} />
                        </div>
                        <div className="rp-field">
                            <label>Teléfono</label>
                            <input name="telefono" type="tel" value={form.telefono} onChange={handleChange}
                                placeholder="2222-3333" />
                        </div>

                        {/* Fila 3 – Ubicación: Dirección fila completa */}
                        <div className="rp-field rp-span3">
                            <label>Dirección Fiscal</label>
                            <input name="direccion" value={form.direccion} onChange={handleChange}
                                placeholder="Zona 10, Ciudad de Guatemala" />
                        </div>

                        {/* Status banners */}
                        {status === "success" && (
                            <div className="rp-banner ok rp-span3">
                                <i className="bi bi-check-circle-fill"></i><span>{message}</span>
                            </div>
                        )}
                        {status === "error" && (
                            <div className="rp-banner err rp-span3">
                                <i className="bi bi-exclamation-triangle-fill"></i><span>{message}</span>
                            </div>
                        )}
                    </div>
                </form>

                {/* ── RIGHT: upload + submit ── */}
                <div className="preview-stack-v3">
                    <div className="pane-v3" style={{ background: "white", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div className="pane-header-v3">
                            <span><i className="bi bi-file-earmark-arrow-up text-primary me-2"></i>Constancia RTU / Documento Fiscal</span>
                            {pdfFile && (
                                <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#2563eb", background: "#eff6ff", padding: "3px 10px", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                                    <i className="bi bi-cpu me-1"></i>IA Activa
                                </span>
                            )}
                        </div>

                        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                            {/* Drop zone */}
                            <label
                                className={`rp-file-zone ${pdfFile ? "is-ready" : ""} ${dragOver ? "drag-over" : ""}`}
                                onClick={() => fileRef.current?.click()}
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                style={{ flex: 1 }}
                            >
                                <input
                                    ref={fileRef} type="file"
                                    accept="application/pdf,image/png,image/jpeg"
                                    hidden onChange={e => handleFileSelect(e.target.files[0])}
                                />
                                <i className={`bi ${pdfFile ? "bi-file-earmark-check-fill" : "bi-file-earmark-arrow-up"}`}></i>
                                <p>{pdfFile ? "Archivo Cargado" : "Arrastra o haz clic"}</p>
                                <span className="rp-sub">PDF, PNG o JPEG · Máx. 15 MB</span>
                                {pdfFile && (
                                    <span className="rp-chip" onClick={removeFile}>
                                        <i className="bi bi-paperclip"></i>
                                        {pdfFile.name}
                                        <i className="bi bi-x x"></i>
                                    </span>
                                )}
                            </label>

                            <p className={`rp-ai-hint ${pdfFile ? "on" : ""}`}>
                                <i className={`bi ${pdfFile ? "bi-cpu-fill" : "bi-cpu"}`}></i>
                                {pdfFile
                                    ? "Los datos se extraerán automáticamente con IA."
                                    : "Si adjuntas el documento, los datos se extraen con IA. Si no, completa NIT y correo."}
                            </p>

                            {/* Submit */}
                            <div className="mt-auto text-center">
                                <button
                                    type="submit"
                                    form="rp-form-hidden"
                                    className="btn-modern-primary w-100 py-3 justify-content-center"
                                    disabled={isLoading || !canSubmit}
                                    onClick={handleSubmit}
                                >
                                    {isLoading
                                        ? <Spinner animation="border" size="sm" />
                                        : <><i className="bi bi-building-check me-2"></i>Registrar Proveedor</>
                                    }
                                </button>
                                <p className="rp-footer-note mt-3">
                                    Datos procesados y registrados en Odoo automáticamente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    /* ── Embedded (pestaña en InvoicesPage) ── */
    if (embedded) return content;

    /* ── Standalone (/registro-proveedor) ── */
    return (
        <div className="page-container animate-in">
            <div style={{ padding: "2rem 1.5rem" }}>
                {/* Mini-header igual al de Facturación */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: "1.5rem", padding: "0.5rem 1rem",
                    borderBottom: "1px solid #e2e8f0",
                    maxWidth: 1200, width: "100%", marginLeft: "auto", marginRight: "auto",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <h1 style={{ fontSize: "1.5rem", fontWeight: 950, color: "#0f172a", letterSpacing: "-0.5px", margin: 0 }}>
                            Registro de Proveedor
                        </h1>
                        <div style={{ display: "flex", flexDirection: "column", borderLeft: "2px solid #e2e8f0", paddingLeft: 15 }}>
                            <span style={{ fontSize: "0.6rem", letterSpacing: "1px", textTransform: "uppercase", color: "#2563eb", fontWeight: 900 }}>Mundo Verde</span>
                            <span style={{ fontSize: "0.55rem", color: "#64748b", fontWeight: 700 }}>Portal de Proveedores</span>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto" }}>
                    {content}
                </div>
            </div>
        </div>
    );
}
