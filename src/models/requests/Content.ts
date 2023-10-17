export interface CreateContentRequest {
  title: string;
  content: string;
  resourceId?: string | number;
  linkage?: "O3" | "Course" | "Venue" | "Game" | "Event" | "NA";
  fromDate?: string;
  toDate?: string;
  ytbUrl?: string;
  contentImage?: {
    fileName: string;
    fileContent: string;
  };
}

export interface UpdateContentRequest {
  id: number;
  title: string;
  content: string;
  resourceId?: string;
  fromDate?: string;
  toDate?: string;
  contentImage?: {
    fileName: string;
    fileContent: string;
  };
  ytbUrl?: string;
  linkage?: string;
}
