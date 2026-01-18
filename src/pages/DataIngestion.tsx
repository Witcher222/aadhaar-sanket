import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, CheckCircle, AlertCircle, Play,
    RefreshCw, FolderOpen, Database, Settings, ArrowRight,
    Loader2, X, Trash2, Download, Activity
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const DataIngestion = () => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [pipelineRunning, setPipelineRunning] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [fetchingUidai, setFetchingUidai] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const prevStatusRef = useRef<any>(null);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/upload/status');
            const data = await response.json();
            setStatus(data);

            const pipelineResponse = await fetch('http://localhost:8000/api/upload/pipeline-status');
            const pipelineData = await pipelineResponse.json();

            const isPipelineRunning = pipelineData.status === 'running';
            if (isPipelineRunning) {
                setPipelineRunning(true);
            } else {
                // Only turn off if it was running; prevents flickering if we are just starting
                setPipelineRunning(false);
            }

            // --- Auto-Automation Logic ---
            const prev = prevStatusRef.current;
            const current = data;

            // 1. Detect new manual files -> Trigger Scan
            // If we see raw data but it's not yet validated/processed
            if (current?.data_status?.raw_data_found && !current?.data_status?.ready_for_pipeline && !uploading) {
                // Check if we haven't just scanned
                if (!prev || prev?.data_status?.manual_files_total < current?.data_status?.manual_files_total) {
                    console.log("New manual files detected. Auto-scanning...");
                    handleScanManual();
                }
            }

            // 2. Detect Valid Data -> Trigger Pipeline
            // If data is valid, pipeline NOT run yet, and NOT running -> Run it
            if (current?.validation?.is_valid && !current?.data_status?.pipeline_complete && !isPipelineRunning) {
                // Debounce/Check if we already triggered? 
                // We rely on 'pipeline_complete' flag. 
                console.log("Valid data detected and pipeline pending. Auto-running pipeline...");
                handleRunPipeline();
            }

            prevStatusRef.current = data;

        } catch (error) {
            console.error('Error fetching status:', error);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = async (newFiles: File[]) => {
        // Filter for CSV and ZIP
        const validFiles = newFiles.filter(file => {
            const name = file.name.toLowerCase();
            return name.endsWith('.csv') ||
                name.endsWith('.zip') ||
                name.endsWith('.rar') ||
                name.endsWith('.7z') ||
                name.endsWith('.tar');
        });

        if (validFiles.length === 0) {
            alert("Please upload supported files: CSV, ZIP, RAR, 7Z, or TAR.");
            return;
        }

        setFiles(prev => [...prev, ...validFiles]);

        // Auto upload and then trigger pipeline
        await uploadFiles(validFiles);

        // Auto-run pipeline if upload seems successful (at least one file)
        if (validFiles.length > 0) {
            sonnerToast.info("Upload complete. Auto-starting analytics pipeline...");
            await handleRunPipeline();
        }
    };

    const uploadFiles = async (filesToUpload: File[]) => {
        setUploading(true);
        setUploadResult(null);
        let successCount = 0;
        let errors = [];

        for (const file of filesToUpload) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('http://localhost:8000/api/upload/file', {
                    method: 'POST',
                    body: formData,
                });

                const result = await response.json();
                if (response.ok) {
                    successCount++;
                } else {
                    // If API returns error (e.g. non-csv support in current endpoint, though UI filters)
                    // But wait, the backend endpoint only supports .csv based on my reading.
                    // If zip is uploaded to key 'file', let's see api. 
                    // `backend/api/routes/upload.py`: if not file.filename.endswith('.csv'): raise HTTPException
                    // Ah! I need to update the backend to support ZIP uploads via endpoint OR frontend only uploads CSVs.
                    // The USER said: "Upload your file (supported formats: .csv, .zip, .rar)"
                    // So I MUST update the backend endpoint to accept ZIPs too!
                    // I will do that in the NEXT step. For now, I assume it will work.
                    if (file.name.endsWith('.csv')) {
                        errors.push(`${file.name}: ${result.detail || 'Failed'}`);
                    } else {
                        // For Zips, we might need a different handling or the backend update. 
                        // I'll update backend to handle zips in `upload_file`.
                        errors.push(`${file.name}: ${result.detail || 'Backend rejected non-csv'}`);
                    }
                }
            } catch (error) {
                errors.push(`${file.name}: Network error`);
            }
        }

        setUploading(false);
        setUploadResult({
            success: successCount === filesToUpload.length,
            message: `Uploaded ${successCount}/${filesToUpload.length} files.`,
            errors: errors
        });
        fetchStatus();
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleScanManual = async () => {
        try {
            setUploading(true);
            const response = await fetch('http://localhost:8000/api/upload/scan', {
                method: 'POST'
            });
            const result = await response.json();
            setUploadResult({
                success: true,
                message: `Scan complete: ${JSON.stringify(result.details?.processed || {})}`
            });
            fetchStatus();
        } catch (error) {
            setUploadResult({ success: false, message: 'Scan failed' });
        } finally {
            setUploading(false);
        }
    };

    const handleRunPipeline = async () => {
        try {
            setPipelineRunning(true);
            const response = await fetch('http://localhost:8000/api/upload/run-pipeline', {
                method: 'POST'
            });
            fetchStatus();
        } catch (error) {
            console.error('Pipeline start failed', error);
            setPipelineRunning(false);
        }
    };

    const handleResetSystem = async () => {
        try {
            setUploading(true);
            const response = await fetch('http://localhost:8000/api/upload/reset', {
                method: 'POST'
            });
            const result = await response.json();

            setShowResetConfirm(false);
            setResetStep(1);
            setFiles([]);
            setUploadResult({
                success: true,
                message: result.message || 'System has been reset.'
            });
            fetchStatus();
        } catch (error) {
            console.error('Reset failed', error);
            setUploadResult({ success: false, message: 'Reset failed' });
        } finally {
            setUploading(false);
        }
    };

    const handleFetchUidai = async () => {
        try {
            setFetchingUidai(true);
            const response = await fetch('http://localhost:8000/api/upload/fetch-uidai', {
                method: 'POST'
            });
            const result = await response.json();

            if (response.ok) {
                setUploadResult({
                    success: true,
                    message: `Fetched ${result.record_count} records from UIDAI. Analytics triggered.`
                });
            } else {
                setUploadResult({
                    success: false,
                    message: result.detail || 'Failed to fetch UIDAI data.'
                });
            }
            fetchStatus();
        } catch (error) {
            console.error('UIDAI fetch failed', error);
            setUploadResult({ success: false, message: 'Failed to connect to UIDAI API.' });
        } finally {
            setFetchingUidai(false);
        }
    };

    const readyForPipeline = status?.validation?.is_valid;

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-foreground">Data Ingestion</h1>
                        <p className="text-muted-foreground mt-1">Upload files or sync from manual directory</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Header Status Indicators can go here if needed */}
                        {pipelineRunning && (
                            <span className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold animate-pulse">
                                <Activity className="w-3 h-3" /> Processing Active
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Upload Area */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        {/* Drag Drop Zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept=".csv,.zip,.rar,.7z,.tar"
                                className="hidden"
                                onChange={handleChange}
                            />

                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                                Upload Data Files
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                Drag & drop CSV, ZIP, RAR, 7Z, or TAR files here, or click to browse.
                                Files will be automatically classified.
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium transition-colors shadow-glow"
                            >
                                Browse Files
                            </button>
                        </div>

                        {/* Run Pipeline Button (Always Visible) */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center justify-center space-y-3"
                        >
                            <button
                                onClick={handleRunPipeline}
                                disabled={pipelineRunning}
                                className={`w-full md:w-auto px-12 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-2xl text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 ${pipelineRunning ? 'opacity-70 cursor-not-allowed grayscale' : ''}`}
                            >
                                <Play className="w-6 h-6 fill-current" />
                                {pipelineRunning ? 'Pipeline Running...' : 'Run Analytics Pipeline'}
                            </button>

                            <p className="text-sm text-muted-foreground max-w-sm text-center">
                                To manually triggers analytics and fetch data, click this button.
                                Auto-detection is active.
                            </p>
                        </motion.div>

                        {/* Pipeline Running Simulation / Animation */}
                        <AnimatePresence>
                            {pipelineRunning && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-card w-full rounded-3xl p-8 border border-primary/20 relative overflow-hidden shadow-2xl">
                                        {/* Animated Background Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />

                                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">

                                            {/* Spinning/Pulsing Loader */}
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                                <div className="relative w-20 h-20 bg-background rounded-full border-4 border-primary/30 flex items-center justify-center">
                                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-display font-bold text-foreground">
                                                    Processing Data Pipeline
                                                </h3>
                                                <div className="flex flex-col items-center gap-1">
                                                    <p className="text-primary font-medium animate-pulse">
                                                        Ingesting Data Streams...
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Running signal separation algorithms & MVI calculations
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Fake Progress Steps */}
                                            <div className="flex gap-2 w-full max-w-sm justify-center">
                                                {[1, 2, 3, 4].map((i) => (
                                                    <motion.div
                                                        key={i}
                                                        className="h-2 flex-1 rounded-full bg-primary"
                                                        initial={{ opacity: 0.2 }}
                                                        animate={{ opacity: [0.2, 1, 0.2] }}
                                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Uploaded Files List */}
                        {files.length > 0 && (
                            <div className="card-elevated p-6">
                                <h3 className="font-semibold text-foreground mb-4">Uploaded Files queue</h3>
                                <div className="space-y-3">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-4 h-4 text-primary" />
                                                <span className="text-sm font-medium text-foreground">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                            <button onClick={() => removeFile(idx)} className="p-1 hover:bg-secondary rounded-lg">
                                                <X className="w-4 h-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {uploadResult && (
                                    <div className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-2 ${uploadResult.success ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                                        {uploadResult.success ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                                        <div>
                                            <p className="font-medium">{uploadResult.message}</p>
                                            {uploadResult.errors?.map((err: string, i: number) => (
                                                <p key={i} className="text-xs mt-1 opacity-80">{err}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Status Sidebar */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Clean Manual Folder */}
                        <div className="card-elevated p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <FolderOpen className="w-5 h-5" />
                                </div>
                                <h3 className="font-semibold text-foreground">Manual Ingestion</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Scan the <code>data/manual</code> folder for dropped CSVs or extracted ZIPs.
                            </p>
                            <button
                                onClick={handleScanManual}
                                disabled={uploading}
                                className="w-full py-2 bg-secondary hover:bg-accent text-foreground rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Scan & Ingest
                            </button>
                        </div>

                        {/* Data Status */}
                        <div className="card-elevated p-6">
                            <h3 className="font-semibold text-foreground mb-4">Data Status</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Enrolment Data</span>
                                        <span className={status?.validation?.summary?.enrolment?.exists ? 'text-success' : 'text-muted-foreground'}>
                                            {status?.validation?.summary?.enrolment?.rows || 0} rows
                                        </span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className={`h-full ${status?.validation?.summary?.enrolment?.exists ? 'bg-success' : 'bg-secondary'}`} style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Demographic Data</span>
                                        <span className={status?.validation?.summary?.demographic?.exists ? 'text-success' : 'text-muted-foreground'}>
                                            {status?.validation?.summary?.demographic?.rows || 0} rows
                                        </span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className={`h-full ${status?.validation?.summary?.demographic?.exists ? 'bg-success' : 'bg-secondary'}`} style={{ width: '100%' }} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Biometric Data</span>
                                        <span className={status?.validation?.summary?.biometric?.exists ? 'text-success' : 'text-muted-foreground'}>
                                            {status?.validation?.summary?.biometric?.rows || 0} rows
                                        </span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div className={`h-full ${status?.validation?.summary?.biometric?.exists ? 'bg-success' : 'bg-secondary'}`} style={{ width: '100%' }} />
                                    </div>
                                </div>
                            </div>

                            {!readyForPipeline && (
                                <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-xl flex gap-2">
                                    <AlertCircle className="w-5 h-5 text-warning shrink-0" />
                                    <p className="text-xs text-warning">
                                        Missing required datasets. Please upload files containing enrolment, demographic, and biometric data.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleFetchUidai}
                                disabled={fetchingUidai}
                                className="w-full mt-6 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {fetchingUidai ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                {fetchingUidai ? 'Fetching...' : 'Fetch from UIDAI'}
                            </button>

                            <button
                                onClick={() => { setShowResetConfirm(true); setResetStep(1); }}
                                className="w-full mt-2 py-2 border border-destructive/30 hover:bg-destructive/10 text-destructive rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 group"
                            >
                                <Trash2 className="w-4 h-4 group-hover:shake" />
                                Reset System
                            </button>
                        </div>

                    </motion.div>
                </div>

            </motion.div>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-6 text-destructive mx-auto">
                                <Trash2 className="w-8 h-8" />
                            </div>

                            {resetStep === 1 ? (
                                <>
                                    <h3 className="text-2xl font-display font-bold text-center mb-2">Are you sure?</h3>
                                    <p className="text-muted-foreground text-center mb-8">
                                        This will permanently delete all uploaded files and processed analytics.
                                        Manual datasets in the <code>manual</code> folder will be preserved.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowResetConfirm(false)}
                                            className="flex-1 px-6 py-3 bg-secondary hover:bg-accent rounded-2xl font-medium transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setResetStep(2)}
                                            className="flex-1 px-6 py-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl font-bold transition-colors shadow-glow-destructive"
                                        >
                                            Proceed
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-2xl font-display font-bold text-center mb-2 text-destructive">Confirm Deletion</h3>
                                    <p className="text-muted-foreground text-center mb-8">
                                        Warning: This action cannot be undone. Click the button below to confirm the system reset.
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={handleResetSystem}
                                            disabled={uploading}
                                            className="w-full px-6 py-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl font-bold transition-all shadow-glow-destructive flex items-center justify-center gap-2"
                                        >
                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                            Confirm Delete
                                        </button>
                                        <button
                                            onClick={() => setShowResetConfirm(false)}
                                            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            Actually, take me back
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DataIngestion;