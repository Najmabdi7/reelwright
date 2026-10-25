import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { Subtitles } from "./components/Subtitles";
import { HookScene } from "./scenes/HookScene";
import { BrowserScene } from "./scenes/BrowserScene";
import { NativeHopperScene } from "./scenes/NativeHopperScene";
import { MultiplatformScene } from "./scenes/MultiplatformScene";
import { TerminalScene } from "./scenes/TerminalScene";
import { CaseStudyScene } from "./scenes/CaseStudyScene";
import { EthicsScene } from "./scenes/EthicsScene";
import { OutroScene } from "./scenes/OutroScene";
import rawData from "./video_data.json";
import { VideoData } from "./types";

const data = rawData as VideoData;

export const VideoEssay: React.FC = () => {
  const transitions = [162, 551, 877, 1241, 1631, 1912, 2195];

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
      {/* 1. Atmospheric Moving Cyber Background */}
      <Background />

      {/* 2. Audio Layer */}
      {/* Full French Voiceover with correct GitHub pronunciation */}
      <Audio src={staticFile(data.audioSrc)} volume={1.0} />

      {/* Subtle Background Music with ducking */}
      <Audio src={staticFile(data.bgmSrc)} volume={0.16} loop />

      {/* Transition sound effects */}
      {transitions.map((frameNum) => (
        <Sequence key={frameNum} from={frameNum - 3} durationInFrames={30}>
          <Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} />
        </Sequence>
      ))}

      {/* Element entrance pop sounds */}
      {[10, 180, 570, 895, 1260, 1650, 1930, 2215].map((frameNum) => (
        <Sequence key={`pop-${frameNum}`} from={frameNum} durationInFrames={15}>
          <Audio src={staticFile("sfx/pop.wav")} volume={0.35} />
        </Sequence>
      ))}

      {/* 3. Visual Scenes Sequence */}

      {/* Scene 1: Hook */}
      <Sequence from={data.scenes[0].startFrame} durationInFrames={data.scenes[0].durationInFrames}>
        <HookScene
          title={data.scenes[0].title}
          subtitle={data.scenes[0].subtitle}
          badge={data.scenes[0].badge}
        />
      </Sequence>

      {/* Scene 2: GitHub Viral Phenomenon */}
      <Sequence from={data.scenes[1].startFrame} durationInFrames={data.scenes[1].durationInFrames}>
        <BrowserScene
          url={data.scenes[1].url}
          imageSrc={data.scenes[1].imageSrc}
          title={data.scenes[1].title}
          stars={data.scenes[1].stars}
          badge={data.scenes[1].badge}
        />
      </Sequence>

      {/* Scene 3: Native Hopper & Ghidra Inspection */}
      <Sequence from={data.scenes[2].startFrame} durationInFrames={data.scenes[2].durationInFrames}>
        <NativeHopperScene
          imageSrc={data.scenes[2].imageSrc}
          title={data.scenes[2].title}
          badge={data.scenes[2].badge}
        />
      </Sequence>

      {/* Scene 4: Multiplatform Deconstruction */}
      <Sequence from={data.scenes[3].startFrame} durationInFrames={data.scenes[3].durationInFrames}>
        <MultiplatformScene
          badge={data.scenes[3].badge}
          cards={data.scenes[3].cards}
        />
      </Sequence>

      {/* Scene 5: Autonomous Agent & Reconstruction Ledger */}
      <Sequence from={data.scenes[4].startFrame} durationInFrames={data.scenes[4].durationInFrames}>
        <TerminalScene
          command={data.scenes[4].command}
          badge={data.scenes[4].badge}
        />
      </Sequence>

      {/* Scene 6: Real Case Study (Adobe vs Open Source) */}
      <Sequence from={data.scenes[5].startFrame} durationInFrames={data.scenes[5].durationInFrames}>
        <CaseStudyScene
          badge={data.scenes[5].badge}
          title={data.scenes[5].title}
          desc={data.scenes[5].desc}
        />
      </Sequence>

      {/* Scene 7: Ethics, Legal & Future */}
      <Sequence from={data.scenes[6].startFrame} durationInFrames={data.scenes[6].durationInFrames}>
        <EthicsScene
          badge={data.scenes[6].badge}
          points={data.scenes[6].points}
        />
      </Sequence>

      {/* Scene 8: Outro & Debate */}
      <Sequence from={data.scenes[7].startFrame} durationInFrames={data.scenes[7].durationInFrames}>
        <OutroScene
          badge={data.scenes[7].badge}
          question={data.scenes[7].question}
          cta={data.scenes[7].cta}
        />
      </Sequence>

      {/* 4. Global Dynamic Karaoke Subtitles */}
      <Subtitles words={data.words} />
    </div>
  );
};
