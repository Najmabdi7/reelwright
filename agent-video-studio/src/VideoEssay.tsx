import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { SubtitleTrack } from "./components/SubtitleTrack";
import { HookScene } from "./scenes/HookScene";
import { BrowserScene } from "./scenes/BrowserScene";
import { NativeHopperScene } from "./scenes/NativeHopperScene";
import { MultiplatformScene } from "./scenes/MultiplatformScene";
import { TerminalScene } from "./scenes/TerminalScene";
import { CaseStudyScene } from "./scenes/CaseStudyScene";
import { EthicsScene } from "./scenes/EthicsScene";
import { OutroScene } from "./scenes/OutroScene";
import rawData from "./video_data.json";
import { SceneData, VideoData } from "./types";

const data = rawData as unknown as VideoData;

/** Scènes 16:9 disponibles pour le format long. */
const REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  hook: HookScene as unknown as React.ComponentType<Record<string, unknown>>,
  browser: BrowserScene as unknown as React.ComponentType<Record<string, unknown>>,
  native_hopper: NativeHopperScene as unknown as React.ComponentType<Record<string, unknown>>,
  multiplatform: MultiplatformScene as unknown as React.ComponentType<Record<string, unknown>>,
  terminal: TerminalScene as unknown as React.ComponentType<Record<string, unknown>>,
  casestudy: CaseStudyScene as unknown as React.ComponentType<Record<string, unknown>>,
  ethics: EthicsScene as unknown as React.ComponentType<Record<string, unknown>>,
  outro: OutroScene as unknown as React.ComponentType<Record<string, unknown>>,
};

export const VideoEssay: React.FC = () => {
  if (data.fps !== 30) {
    throw new Error(
      `VideoEssay attend un video_data.json à 30 fps (reçu ${data.fps}). Relancer avec --format long.`,
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "#080B11",
        overflow: "hidden",
      }}
    >
      <Background />

      {/* voix + musique duckée + SFX : un seul fichier mixé en amont par ffmpeg */}
      <Audio src={staticFile(data.audioSrc)} volume={1} />

      {data.scenes.map((scene: SceneData) => {
        const Component = REGISTRY[scene.type];
        if (!Component) {
          throw new Error(`type de scène inconnu pour le format long : ${scene.type}`);
        }
        return (
          <Sequence key={scene.id} from={scene.startFrame} durationInFrames={scene.durationInFrames}>
            <Component {...scene} />
          </Sequence>
        );
      })}

      <SubtitleTrack lines={data.lines} fontSize={32} bottom={80} maxWidth={1400} />
    </div>
  );
};
