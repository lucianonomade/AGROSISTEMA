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
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (open && !isScanning) {
            startScanner();
        }

        return () => {
            stopScanner();
        };
    }, [open]);

    const startScanner = async () => {
        try {
            setError(null);
            const scanner = new Html5Qrcode("barcode-reader");
            scannerRef.current = scanner;

            await scanner.start(
                { facingMode: "environment" }, // Use back camera on mobile
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    onScan(decodedText);
                    stopScanner();
                    onClose();
                },
                (errorMessage) => {
                    // Ignore "No MultiFormat Readers were able to detect the code" errors
                    // These are normal when no barcode is in view
                }
            );
            setIsScanning(true);
        } catch (err: any) {
            console.error("Error starting scanner:", err);
            setError("Erro ao acessar a câmera. Verifique as permissões.");
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
                scannerRef.current = null;
                setIsScanning(false);
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
    };

    const handleClose = () => {
        stopScanner();
        setError(null);
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
                            <p className="text-sm text-destructive">{error}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                                Certifique-se de permitir o acesso à câmera quando solicitado.
                            </p>
                        </div>
                    ) : (
                        <div className="relative w-full overflow-hidden rounded-lg bg-black">
                            <div id="barcode-reader" className="w-full"></div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground text-center">
                            Posicione o código de barras dentro da área destacada
                        </p>
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
