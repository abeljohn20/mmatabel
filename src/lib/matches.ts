import type { MatchReport, Narrative } from "./types";

import Adhithya_report from "@/data/Adhithya_799_v4_report.json";
import Adhithya_narrative from "@/data/Adhithya_799_narrative.json";
import Harshan_report from "@/data/Harshan_793_v4_report.json";
import Harshan_narrative from "@/data/Harshan_793_narrative.json";
import Varshan_report from "@/data/Varshan_820_v4_report.json";
import Varshan_narrative from "@/data/Varshan_820_narrative.json";
import Lakshya_report from "@/data/Lakshya_3tag_v4_report.json";
import Lakshya_narrative from "@/data/Lakshya_3tag_narrative.json";

export interface MatchData {
  report: MatchReport;
  narrative: Narrative;
  label: string;
}

export const matches: MatchData[] = [
  { report: Lakshya_report as unknown as MatchReport, narrative: Lakshya_narrative as unknown as Narrative, label: "Lakshya (108 rallies, 3 games)" },
  { report: Varshan_report as unknown as MatchReport, narrative: Varshan_narrative as unknown as Narrative, label: "Varshan (54 rallies, 2 games)" },
  { report: Harshan_report as unknown as MatchReport, narrative: Harshan_narrative as unknown as Narrative, label: "Harshan (46 rallies, 3 games)" },
  { report: Adhithya_report as unknown as MatchReport, narrative: Adhithya_narrative as unknown as Narrative, label: "Adhithya (43 rallies, 1 game)" },
];
