export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SubtitleLine {
  words: WordTiming[];
  start: number;
  end: number;
}

export interface CounterSpec {
  value: number;
  label: string;
  accent?: string;
}

export interface SceneData {
  id: string;
  type: string;
  startFrame: number;
  durationInFrames: number;
  badge?: string;
  title?: string;
  sub?: string;
  subtitle?: string;
  question?: string;
  cta?: string;
  footnote?: string;
  chips?: string[];
  tools?: string[];
  targets?: string[];
  steps?: string[];
  facts?: string[];
  counters?: CounterSpec[];
  imageSrc?: string;
  url?: string;
  stars?: string;
  desc?: string;
  command?: string;
  cards?: { icon: string; title: string; desc: string }[];
  points?: { title: string; desc: string }[];
  [key: string]: unknown;
}

export interface VideoData {
  title: string;
  fps: number;
  width: number;
  height: number;
  totalFrames: number;
  durationSeconds: number;
  audioSrc: string;
  scenes: SceneData[];
  words: WordTiming[];
  lines: SubtitleLine[];
  sceneStartsSeconds: number[];
}
