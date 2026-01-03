import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    type PointerEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

type AvatarCropDialogProps = {
    open: boolean;
    file: File | null;
    imageUrl: string | null;
    onClose: () => void;
    onComplete: (file: File, dataUrl: string) => void;
};

const CROP_SIZE = 280;
const PREVIEW_BOX = 340;

export default function AvatarCropDialog({
    open,
    file,
    imageUrl,
    onClose,
    onComplete,
}: AvatarCropDialogProps) {
    const dragRef = useRef<{
        startX: number;
        startY: number;
        originX: number;
        originY: number;
    } | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    const [imageSize, setImageSize] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const [baseScale, setBaseScale] = useState(1);
    const [zoom, setZoom] = useState(1.1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!open || !imageUrl) return;

        const img = new Image();

        img.onload = () => {
            const coverScale = Math.max(
                CROP_SIZE / img.width,
                CROP_SIZE / img.height,
            );

            setImageSize({ width: img.width, height: img.height });
            setBaseScale(coverScale);
            setZoom(1.1);
            setPosition({ x: 0, y: 0 });
            imageRef.current = img;
        };

        img.src = imageUrl;
    }, [imageUrl, open]);

    const currentScale = useMemo(
        () => baseScale * zoom,
        [baseScale, zoom],
    );

    const clampPosition = useCallback(
        (next: { x: number; y: number }, nextZoom?: number) => {
            if (!imageSize) return next;

            const scale = baseScale * (nextZoom ?? zoom);
            const scaledWidth = imageSize.width * scale;
            const scaledHeight = imageSize.height * scale;

            const maxX = Math.max((scaledWidth - CROP_SIZE) / 2, 0);
            const maxY = Math.max((scaledHeight - CROP_SIZE) / 2, 0);

            return {
                x: Math.min(Math.max(next.x, -maxX), maxX),
                y: Math.min(Math.max(next.y, -maxY), maxY),
            };
        },
        [baseScale, imageSize, zoom],
    );

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            originX: position.x,
            originY: position.y,
        };
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;

        const deltaX = event.clientX - dragRef.current.startX;
        const deltaY = event.clientY - dragRef.current.startY;

        setPosition(
            clampPosition({
                x: dragRef.current.originX + deltaX,
                y: dragRef.current.originY + deltaY,
            }),
        );
    };

    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current) return;

        event.currentTarget.releasePointerCapture(event.pointerId);
        dragRef.current = null;
    };

    const handleZoomChange = (value: number) => {
        const safeValue = Math.min(Math.max(value, 1), 3);

        setZoom(safeValue);
        setPosition((current) => clampPosition(current, safeValue));
    };

    const handleSave = () => {
        if (!imageRef.current || !imageSize) return;

        const canvas = document.createElement('canvas');
        canvas.width = CROP_SIZE;
        canvas.height = CROP_SIZE;

        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        const scaledWidth = imageSize.width * currentScale;
        const scaledHeight = imageSize.height * currentScale;

        ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);

        ctx.save();
        ctx.beginPath();
        ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(
            imageRef.current,
            CROP_SIZE / 2 - scaledWidth / 2 + position.x,
            CROP_SIZE / 2 - scaledHeight / 2 + position.y,
            scaledWidth,
            scaledHeight,
        );

        ctx.restore();

        const dataUrl = canvas.toDataURL('image/png');
        const fileName = file?.name
            ? `${file.name.replace(/\.[^/.]+$/, '')}-cropped.png`
            : 'avatar.png';

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                const croppedFile = new File([blob], fileName, {
                    type: 'image/png',
                });

                onComplete(croppedFile, dataUrl);
            },
            'image/png',
            0.92,
        );
    };

    if (!open || !imageUrl || !file) {
        return null;
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Regola la tua foto profilo</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div
                        className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-xl border border-border bg-muted"
                        style={{ height: PREVIEW_BOX }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        <img
                            src={imageUrl}
                            alt="Anteprima avatar"
                            className="absolute left-1/2 top-1/2 select-none"
                            style={{
                                width: imageSize ? `${imageSize.width}px` : 'auto',
                                height: imageSize
                                    ? `${imageSize.height}px`
                                    : 'auto',
                                maxWidth: 'none',
                                maxHeight: 'none',
                                transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${currentScale})`,
                                transformOrigin: 'center',
                                userSelect: 'none',
                            }}
                            draggable={false}
                        />
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{
                                WebkitMaskImage: `radial-gradient(circle ${CROP_SIZE / 2}px at 50% 50%, transparent ${CROP_SIZE / 2}px, black ${
                                    CROP_SIZE / 2 + 1
                                }px)`,
                                maskImage: `radial-gradient(circle ${CROP_SIZE / 2}px at 50% 50%, transparent ${CROP_SIZE / 2}px, black ${
                                    CROP_SIZE / 2 + 1
                                }px)`,
                                backgroundColor: 'rgba(0,0,0,0.55)',
                            }}
                        />
                        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white/70" />
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                            Zoom
                        </span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={(event) =>
                                handleZoomChange(Number(event.target.value))
                            }
                            className="h-2 w-full cursor-pointer"
                        />
                    </div>
                </div>

                <DialogFooter className="mt-2 gap-2">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Annulla
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        Applica ritaglio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
