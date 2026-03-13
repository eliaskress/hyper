import { Card } from "@/components/ui/card";
import { HiBreakdownDetail } from "./hi-breakdown-detail";

interface Props {
  hiDelivered: string;
  engagement: {
    likes: number;
    comments: number;
    saves: number;
    shares: number;
    reach: number;
  };
}

export function HiBreakdown({ hiDelivered, engagement }: Props) {
  return (
    <Card className="mb-6">
      <div className="mb-3">
        <p className="text-xs text-gray-500">HI Delivered (all time)</p>
        <p className="text-2xl font-bold">{hiDelivered}</p>
      </div>
      <div className="grid grid-cols-5 gap-1 text-center text-xs">
        <div>
          <p className="text-gray-500">Likes</p>
          <p className="font-medium">{engagement.likes.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Cmts</p>
          <p className="font-medium">{engagement.comments.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Saves</p>
          <p className="font-medium">{engagement.saves.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Shares</p>
          <p className="font-medium">{engagement.shares.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Reach</p>
          <p className="font-medium">{engagement.reach.toLocaleString()}</p>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
        HI measures real influence. Shares and saves count more because they spread your restaurant to new people.
      </p>
      <HiBreakdownDetail />
    </Card>
  );
}
