import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

type InfoCardProps = {
    title: string;
    value: React.ReactNode;
    Icon: LucideIcon;
};

export default function InfoCard({ title, value, Icon }: InfoCardProps) {
    return (
        <div className="col-span-2 rounded-2xl p-[1.5px] bg-green-500/15 transition duration-300 hover:bg-green-500/25 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)]">
            <Card className="h-full w-full rounded-2xl bg-background border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-medium tracking-normal text-muted-foreground">
                        {title}
                    </CardTitle>
                    <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>

                <CardContent>
                    <div className="text-3xl font-bold">{value}</div>
                </CardContent>
            </Card>
        </div>
    );
}
