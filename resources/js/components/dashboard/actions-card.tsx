import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { ActionsList } from './actions-card/actions-list';
import { ArrivalsPanel } from './actions-card/arrivals-panel';
import { TriageDialog } from './actions-card/triage-dialog';
import type { ActionItem, CreatedEmergency } from './actions-card/types';
import type { Arrival118 } from './arrivals-118-card';

type ActionsCardProps = {
    primaryCta: string;
    actions: ActionItem[];
    onEmergencyCreated?: (emergency: CreatedEmergency) => void;
    arrivals118?: Arrival118[];
    onArrivalHandled?: (arrivalId: Arrival118['id']) => void;
    showArrivals?: boolean;
    enableDisposition?: boolean;
    defaultNotifyPs?: boolean;
    defaultArrivedPs?: boolean;
};

export function ActionsCard({
    primaryCta,
    actions,
    onEmergencyCreated,
    arrivals118 = [],
    onArrivalHandled,
    showArrivals = true,
    enableDisposition = false,
    defaultNotifyPs,
    defaultArrivedPs,
}: ActionsCardProps) {
    const page = usePage<{ props: SharedData }>();
    const currentUserId = page?.props?.auth?.user?.id ?? null;
    const [triageOpen, setTriageOpen] = useState(false);

    return (
        <>
            <Card className="space-y-4">
                <ActionsList actions={actions} />
                <CardContent className="space-y-3">
                    <Button className="w-full" onClick={() => setTriageOpen(true)}>
                        <Play className="size-4" aria-hidden="true" />
                        {primaryCta}
                    </Button>
                    {showArrivals ? (
                        <ArrivalsPanel arrivals={arrivals118} onArrivalHandled={onArrivalHandled} />
                    ) : null}
                </CardContent>
            </Card>

            <TriageDialog
                open={triageOpen}
                onOpenChange={setTriageOpen}
                currentUserId={currentUserId}
                onEmergencyCreated={onEmergencyCreated}
                enableDisposition={enableDisposition}
                defaultNotifyPs={defaultNotifyPs}
                defaultArrivedPs={defaultArrivedPs}
            />
        </>
    );
}

export type { ActionItem, CreatedEmergency };
