import { useState } from "react";
import { BarcodeScannerComponent } from "react-qr-barcode-scanner";
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

    const handleScan = (err: any, result: any) => {
        if (result) {
            onScan(result.text);
            onClose();
        }
        if (err) {
            // Only set error if it's a real error, not just "no barcode found"
            if (err.name !== "NotFoundException") {
                setError("Erro ao acessar a câmera. Verifique as permissões.");
            }
        }
    };

    const handleClose = () => {
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
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-black">
                            <BarcodeScannerComponent
                                width="100%"
                                height="100%"
                                onUpdate={handleScan}
                            />
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Scanning overlay */}
                                <div className="absolute inset-0 border-2 border-primary/50 rounded-lg">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                                </div>
                            </div>
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
