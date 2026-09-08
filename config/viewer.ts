export type ViewerMode = "static" | "sequence";

export type ViewerView = {
  id: string;
  mode: ViewerMode;
  image: string;
  overlay: string;
  frameBasePath?: string;
  frameCount: number;
  posterFrame?: string;
  alt: string;
};

export const viewerViews: ViewerView[] = [
  {
    id: "Video1",
    mode: "static",
    image: "/building/Video1/Video1_000.webp",
    overlay: "/building/Video1/Video1.svg",
    frameBasePath: "/building/Video1",
    frameCount: 99,
    alt: "Reljkoviceva 59, pogled sa ulice",
  },
  {
    id: "Video2",
    mode: "static",
    image: "/building/Video2/Video2_000.webp",
    overlay: "/building/Video2/Video2.svg",
    frameBasePath: "/building/Video2",
    frameCount: 99,
    alt: "Reljkoviceva 59, bocni pogled",
  },
  {
    id: "Video3",
    mode: "static",
    image: "/building/Video3/Video3_000.webp",
    overlay: "/building/Video3/Video3.svg",
    frameBasePath: "/building/Video3",
    frameCount: 99,
    alt: "Reljkoviceva 59, mirniji ugao",
  },
  {
    id: "Video4",
    mode: "static",
    image: "/building/Video4/Video4_000.webp",
    overlay: "/building/Video4/Video4.svg",
    frameBasePath: "/building/Video4",
    frameCount: 99,
    alt: "Reljkoviceva 59, vecernji pogled",
  },
  {
    id: "Video5",
    mode: "static",
    image: "/building/Video5/Video5_000.webp",
    overlay: "/building/Video5/Video5.svg",
    frameBasePath: "/building/Video5",
    frameCount: 99,
    alt: "Reljkoviceva 59, dodatni pogled",
  },
];
