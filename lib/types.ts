export type ChunkStatus = "new" | "learning" | "mastered";

export interface Sentence {
  text: string;
  revealed: boolean;
  hinted: boolean;
  kwRevealed: boolean;
}

export interface Chunk {
  sentences: Sentence[];
  status: ChunkStatus;
}

export interface Folder {
  id: string;
  name: string;
}

export interface Text {
  id: string;
  title: string;
  rawText: string;
  folderId: string | null;
  bookmarked: boolean;
  chunkSize: number;
  chunks: Chunk[];
  createdAt: number;
  updatedAt: number;
}
