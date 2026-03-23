import { useState, useRef, useCallback } from "react";

const WEBHOOK_URL = "https://agentsprod.redtec.ai/webhook/registro-proveedor";
const INITIAL_FORM = { nit: "", nombre: "", direccion: "", correo: "", telefono: "" };

function InputField({ label, name, value, onChange, type = "text", placeholder, hint, required }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {label}{required && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
            </label>
            <input
                type={type} name={name} value={value} onChange={onChange}
                placeholder={placeholder} required={required}
                style={{
                    width: "100%", padding: "10px 14px",
                    border: `1.5px solid ${focused ? "#2d6a4f" : "#d1d5db"}`,
                    borderRadius: 8, fontSize: 14, color: "#111827",
                    background: focused ? "#fff" : "#f9fafb",
                    boxShadow: focused ? "0 0 0 3px rgba(45,106,79,0.12)" : "none",
                    transition: "all 0.15s",
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
            />
            {hint && <p style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 4 }}>{hint}</p>}
        </div>
    );
}

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
        if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
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
        try {
            const trimmed = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
            const fd = new FormData();
            Object.entries(trimmed).forEach(([k, v]) => { if (v) fd.append(k, v); });
            if (pdfFile) fd.append("archivo", pdfFile);

            const response = await fetch(WEBHOOK_URL, { method: "POST", body: fd });
            let data = {};
            try { data = await response.json(); } catch {}

            if (response.ok) {
                setStatus("success");
                setMessage(data.mensaje || "¡Solicitud enviada! El proveedor será registrado en breve.");
                setForm(INITIAL_FORM); setPdfFile(null);
                if (fileRef.current) fileRef.current.value = "";
            } else {
                setStatus("error");
                setMessage(data.error || `Error del servidor (${response.status}). Intenta de nuevo.`);
            }
        } catch {
            setStatus("error");
            setMessage("No se pudo conectar. Verifica tu conexión e intenta de nuevo.");
        }
    };

    const isLoading = status === "loading";
    const canSubmit = pdfFile || (form.nit.trim() && form.correo.trim());

    const alertStyle = (type) => ({
        display: "flex", alignItems: "flex-start", gap: 10,
        borderRadius: 10, padding: "14px 16px", fontSize: 14,
        marginTop: 16, lineHeight: 1.45,
        ...(type === "success" ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534" } :
            type === "error"   ? { background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" } :
                                 { background: "#eff6ff", border: "1px solid #93c5fd", color: "#1e40af" }),
    });

    const card = (
        <div style={{
            background: "#fff", borderRadius: embedded ? 16 : 16, width: "100%", maxWidth: embedded ? "100%" : 540,
            boxShadow: embedded ? "none" : "0 24px 64px rgba(0,0,0,0.25)", overflow: "hidden",
            border: embedded ? "1px solid #e2e8f0" : "none",
        }}>
                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                    padding: "28px 32px 24px", color: "#fff",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <img
                            src="/logomv.png"
                            alt="Mundo Verde"
                            style={{ height: 36, objectFit: "contain" }}
                        />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>
                        Registro de Proveedor
                    </h1>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", margin: 0 }}>
                        Completa el formulario para registrar un nuevo proveedor en el sistema.
                    </p>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} style={{ padding: "28px 32px 32px" }}>
                    <InputField label="NIT" name="nit" value={form.nit} onChange={handleChange}
                        placeholder="123456-7" hint="Sin guion o con guion, ambos son válidos." required={!pdfFile} />
                    <InputField label="Razón social / Nombre" name="nombre" value={form.nombre}
                        onChange={handleChange} placeholder="Empresa Ejemplo S.A." />
                    <InputField label="Dirección fiscal" name="direccion" value={form.direccion}
                        onChange={handleChange} placeholder="Zona 10, Ciudad de Guatemala" />
                    <InputField label="Correo electrónico" name="correo" type="email" value={form.correo}
                        onChange={handleChange} placeholder="contacto@empresa.com" required={!pdfFile} />
                    <InputField label="Teléfono" name="telefono" type="tel" value={form.telefono}
                        onChange={handleChange} placeholder="2222-3333" />

                    <div style={{ height: 1, background: "#f0f0f0", margin: "22px 0" }} />

                    {/* Upload */}
                    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                        Constancia de RTU / Documento fiscal
                        <span style={{ fontSize: 11.5, color: "#9ca3af", marginLeft: 6, fontWeight: 400 }}>(opcional)</span>
                    </label>

                    <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        style={{
                            border: `2px ${pdfFile ? "solid #16a34a" : "dashed #d1d5db"}`,
                            borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer",
                            background: pdfFile || dragOver ? "#f0fdf4" : "#f9fafb",
                            transition: "all 0.15s",
                        }}
                    >
                        <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg"
                            style={{ display: "none" }} onChange={e => handleFileSelect(e.target.files[0])} />
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{pdfFile ? "✅" : "📄"}</div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>
                            {pdfFile ? "Archivo cargado" : "Arrastra tu PDF aquí o haz clic"}
                        </p>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                            {pdfFile ? "Haz clic para cambiar" : "PDF, PNG o JPEG · Máx. 15 MB"}
                        </p>
                        {pdfFile && (
                            <span onClick={removeFile} style={{
                                display: "inline-flex", alignItems: "center", gap: 6,
                                background: "#dcfce7", border: "1px solid #86efac",
                                borderRadius: 20, padding: "4px 12px", fontSize: 12,
                                color: "#166534", fontWeight: 500, marginTop: 10, cursor: "pointer",
                            }}>
                                📎 {pdfFile.name} &nbsp;✕
                            </span>
                        )}
                    </div>

                    <p style={{ fontSize: 11.5, color: pdfFile ? "#16a34a" : "#9ca3af", marginTop: 8 }}>
                        {pdfFile
                            ? "🤖 Los datos se extraerán automáticamente del PDF con IA."
                            : "Si adjuntas el documento, los datos se extraerán automáticamente. Si no, completa NIT y correo."}
                    </p>

                    {status === "success" && (
                        <div style={alertStyle("success")}><span>✅</span><span>{message}</span></div>
                    )}
                    {status === "error" && (
                        <div style={alertStyle("error")}><span>⚠️</span><span>{message}</span></div>
                    )}
                    {status === "loading" && (
                        <div style={alertStyle("info")}><span>⏳</span><span>Enviando solicitud…</span></div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !canSubmit}
                        style={{
                            width: "100%", padding: 13,
                            background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                            color: "#fff", border: "none", borderRadius: 10,
                            fontSize: 15, fontWeight: 700,
                            cursor: isLoading || !canSubmit ? "not-allowed" : "pointer",
                            marginTop: 24, opacity: isLoading || !canSubmit ? 0.6 : 1,
                            transition: "opacity 0.15s, transform 0.1s",
                            letterSpacing: "0.02em",
                        }}
                    >
                        {isLoading ? "Enviando…" : "Registrar Proveedor"}
                    </button>
                </form>

                <div style={{ textAlign: "center", padding: "0 32px 24px", fontSize: 12, color: "#9ca3af" }}>
                    Los datos serán procesados y registrados en Odoo automáticamente.
                </div>
            </div>
    );

    if (embedded) return card;

    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #1a472a 0%, #2d6a4f 50%, #40916c 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px 16px",
        }}>
            {card}
        </div>
    );
}
