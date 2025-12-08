import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface BarcodeScannerProps {
    open: boolean;
    onClose: () => void;
    onScan: (barcode: string) => void;
}

export const BarcodeScanner = ({ open, onClose, onScan }: BarcodeScannerProps) => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            stopScanner();
        };
    }, []);

    useEffect(() => {
        if (open && !isScanning) {
            // Increased delay to ensure DOM is fully ready
            const timer = setTimeout(() => {
                if (mountedRef.current) {
                    // Double-check element exists before starting
                    const element = document.getElementById("barcode-reader");
                    if (element) {
                        startScanner();
                    } else {
                        console.error("barcode-reader element not found in DOM");
                        setError("Erro ao inicializar scanner. Tente novamente.");
                    }
                }
            }, 500); // Increased from 300ms to 500ms
            return () => clearTimeout(timer);
        } else if (!open && isScanning) {
            stopScanner();
        }
    }, [open]);

    const startScanner = async () => {
        try {
            setError(null);
            setIsLoading(true);

            // Check if HTTPS is being used
            if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
                throw new Error("HTTPS é obrigatório para acessar a câmera. Acesse via https://localhost:8080");
            }

            // Check if mediaDevices is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Seu navegador não suporta acesso à câmera. Use Chrome, Firefox ou Edge atualizado.");
            }

            // Check if element exists
            const element = document.getElementById("barcode-reader");
            if (!element) {
                throw new Error("Scanner element not found");
            }

            // List available devices for debugging
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                console.log('Câmeras disponíveis:', videoDevices);

                if (videoDevices.length === 0) {
                    throw new Error("Nenhuma câmera foi detectada no seu dispositivo.");
                }
            } catch (enumError) {
                console.warn("Não foi possível listar dispositivos:", enumError);
            }

            // Request camera permission explicitly with better error handling
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });
                // Stop the test stream
                stream.getTracks().forEach(track => track.stop());
            } catch (permError: any) {
                console.error("Permission error:", permError);

                if (permError.name === 'NotAllowedError') {
                    throw new Error("Permissão de câmera negada. Clique no ícone de cadeado ao lado da URL e permita o acesso à câmera.");
                } else if (permError.name === 'NotFoundError') {
                    throw new Error("Nenhuma câmera foi encontrada no dispositivo.");
                } else if (permError.name === 'NotReadableError') {
                    throw new Error("A câmera está sendo usada por outro aplicativo. Feche outros programas que possam estar usando a câmera.");
                } else if (permError.name === 'OverconstrainedError') {
                    throw new Error("As configurações da câmera não são suportadas pelo seu dispositivo.");
                } else if (permError.name === 'SecurityError') {
                    throw new Error("Erro de segurança. Certifique-se de estar acessando via HTTPS (https://localhost:8080)");
                } else {
                    throw new Error(`Erro ao acessar câmera: ${permError.message || permError.name}`);
                }
            }

            // Verify element exists one more time before creating scanner
            const scannerElement = document.getElementById("barcode-reader");
            if (!scannerElement) {
                throw new Error("Elemento do scanner não encontrado. Aguarde e tente novamente.");
            }

            console.log("Iniciando Html5Qrcode com elemento:", scannerElement);
            const scanner = new Html5Qrcode("barcode-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" }, // Use back camera on mobile
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    if (mountedRef.current) {
                        onScan(decodedText);
                        stopScanner();
                        onClose();
                    }
                },
                (errorMessage) => {
                    // Ignore "No MultiFormat Readers were able to detect the code" errors
                    // These are normal when no barcode is in view
                }
            );

            if (mountedRef.current) {
                setIsScanning(true);
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error("Error starting scanner:", err);
            if (mountedRef.current) {
                setError(err.message || "Erro ao acessar a câmera. Verifique as permissões.");
                setIsScanning(false);
                setIsLoading(false);
            }
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error("Error stopping scanner:", err);
            } finally {
                scannerRef.current = null;
                if (mountedRef.current) {
                    setIsScanning(false);
                }
            }
        }
    };

    const handleClose = () => {
        stopScanner();
        setError(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        Escanear Código de Barras
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Always render the scanner element, but show overlays for loading/error states */}
                    <div className="relative w-full overflow-hidden rounded-lg bg-black min-h-[300px]">
                        <div id="barcode-reader" className="w-full"></div>

                        {/* Loading overlay */}
                        {isLoading && (
                            <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">Iniciando câmera...</p>
                                <p className="text-xs text-muted-foreground text-center px-4">
                                    Permita o acesso à câmera quando solicitado
                                </p>
                            </div>
                        )}

                        {/* Error overlay */}
                        {error && (
                            <div className="absolute inset-0 bg-background/95 flex items-center justify-center p-4">
                                <div className="bg-destructive/10 border border-destructive rounded-lg p-4 max-w-md">
                                    <p className="text-sm text-destructive font-semibold">{error}</p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Certifique-se de permitir o acesso à câmera quando solicitado pelo navegador.
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Em alguns navegadores, você precisa acessar via HTTPS para usar a câmera.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {!error && !isLoading && (
                            <p className="text-sm text-muted-foreground text-center">
                                Posicione o código de barras dentro da área destacada
                            </p>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="w-full"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
