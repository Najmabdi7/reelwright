import "./index.css";
import { Composition } from "remotion";
import { VideoEssay } from "./VideoEssay";
import { ShortEssay } from "./short/ShortEssay";
import rawData from "./video_data.json";
import { VideoData } from "./types";

const data = rawData as unknown as VideoData;

/**
 * Deux compositions :
 *  - Short       : 9:16, cadence et taille lues dans video_data.json (60 fps par défaut)
 *  - VideoEssay  : 16:9 long format, 30 fps
 * La pipeline choisit la composition via --format.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Short"
        component={ShortEssay}
        defaultProps={{ data }}
        durationInFrames={data.totalFrames}
        fps={data.fps}
        width={data.width}
        height={data.height}
      />
      <Composition
        id="VideoEssay"
        component={VideoEssay}
        durationInFrames={Math.round((data.totalFrames * 30) / data.fps)}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
