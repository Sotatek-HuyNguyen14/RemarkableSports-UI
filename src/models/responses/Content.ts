export interface ContentResponse {
  id: number;
  title: string;
  content: string;
  creatorId: string;
  createdAt: Date;
  resourceId?: number;
  fileUrl?: string;
  linkage?: "O3" | "Course" | "Venue" | "Game" | "Event" | "NA";
  fromDate?: Date;
  toDate?: Date;
  views?: number;
  ytbUrl?: string;
}

export interface PostPermissionResponse {
  canPost: boolean;
  createdAt: Date;
  id: number;
  updatedAt: Date;
  userId: string;
}
