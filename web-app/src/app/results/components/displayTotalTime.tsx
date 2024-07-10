import { TotalPlayTime } from "@/app/results/page";

export default function DisplayTotalTime(props: { totalTime: TotalPlayTime }) {
  const totalTime = props.totalTime;
  return (
    <div className="flex flex-col items-center w-full bg-spotify-black-light rounded-md mt-6 py-8 space-y-2">
      <p className="text-2xl font-bold text-white">
        Total time spent listening:
      </p>
      <span className={"text-spotify-green text-4xl font-bold"}>
        {(totalTime.total_msPlayed / 3600000).toFixed(2)}{" "}
        <span className={"text-white"}>hours</span>
      </span>
      <span className={"text-spotify-green text-4xl font-bold"}>
        {(totalTime.total_msPlayed / (3600000 * 24)).toFixed(2)}{" "}
        <span className={"text-white"}>days</span>
      </span>
    </div>
  );
}
