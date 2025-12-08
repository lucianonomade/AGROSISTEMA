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
            // Small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                if (mountedRef.current) {
                    startScanner();
                }
            }, 300);
            return () => clearTimeout(timer);
        } else if (!open && isScanning) {
            stopScanner();
        }
    }, [open]);

    const startScanner = async () => {
        try {
            setError(null);
            setIsLoading(true);

            // Check if element exists
            const element = document.getElementById("barcode-reader");
            if (!element) {
                throw new Error("Scanner element not found");
            }

            // Request camera permission explicitly
            try {
                await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            } catch (permError: any) {
                throw new Error("Permissão de câmera negada. Por favor, permita o acesso à câmera nas configurações do navegador.");
            }

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
                    {error ? (
                        <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                            <p className="text-sm text-destructive font-semibold">{error}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Certifique-se de permitir o acesso à câmera quando solicitado pelo navegador.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Em alguns navegadores, você precisa acessar via HTTPS para usar a câmera.
                            </p>
                        </div>
                    ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-sm text-muted-foreground">Iniciando câmera...</p>
                            <p className="text-xs text-muted-foreground text-center">
                                Permita o acesso à câmera quando solicitado
                            </p>
                        </div>
                    ) : (
                        <div className="relative w-full overflow-hidden rounded-lg bg-black">
                            <div id="barcode-reader" className="w-full"></div>
                        </div>
                    )}

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
