import "./index.css";
import { Composition } from "remotion";
import { VideoEssay } from "./VideoEssay";
import rawData from "./video_data.json";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoEssay"
        component={VideoEssay}
        durationInFrames={rawData.totalFrames}
        fps={rawData.fps}
        width={1920}
        height={1080}
      />
    </>
  );
};
