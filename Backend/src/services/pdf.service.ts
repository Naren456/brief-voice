import PDFDocument from "pdfkit";
import { prisma } from "../db/prisma";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function generatePDFReport(meetingId: string): Promise<Buffer> {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      summary: true,
      actionItems: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).fillColor("#6366f1").text("BriefVoice Meeting Report");
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#111111").text(meeting.filename);
    doc
      .fontSize(10)
      .fillColor("#666666")
      .text(`Generated: ${new Date().toISOString().slice(0, 10)} | Status: ${meeting.status}`);
    doc.moveDown();

    const section = (title: string, items: string[]) => {
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor("#6366f1").text(title);
      doc.moveDown(0.2);
      doc.fontSize(11).fillColor("#111111");

      if (items.length === 0) {
        doc.fillColor("#999999").text("- none -");
        return;
      }

      for (const item of items) {
        doc.text(`- ${item}`, { indent: 10 });
      }
    };

    if (meeting.summary) {
      section("Attendees", parseJsonArray(meeting.summary.attendees));
      section("Key Decisions", parseJsonArray(meeting.summary.keyDecisions));
      section("Discussion Points", parseJsonArray(meeting.summary.discussionPoints));
      section("Open Questions", parseJsonArray(meeting.summary.openQuestions));
      section("Next Steps", parseJsonArray(meeting.summary.nextSteps));
    } else {
      doc.fontSize(11).fillColor("#999999").text("No summary available for this meeting yet.");
    }

    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#6366f1").text("Action Items");
    doc.moveDown(0.2);

    if (meeting.actionItems.length === 0) {
      doc.fontSize(11).fillColor("#999999").text("- none -");
    } else {
      doc.fontSize(11).fillColor("#111111");
      for (const item of meeting.actionItems) {
        const checkbox = item.completed ? "[x]" : "[ ]";
        const meta = [item.owner, item.deadline].filter(Boolean).join(" | ");
        doc.text(`${checkbox} ${item.task}${meta ? ` (${meta})` : ""}`, { indent: 10 });
      }
    }

    doc.end();
  });
}
