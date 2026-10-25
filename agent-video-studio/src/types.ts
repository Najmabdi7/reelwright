export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SentenceTiming {
  text: string;
  start: number;
  end: number;
}

export interface VideoData {
  title: string;
  fps: number;
  totalFrames: number;
  audioSrc: string;
  bgmSrc: string;
  sentences: SentenceTiming[];
  words: WordTiming[];
  scenes: any[];
}
