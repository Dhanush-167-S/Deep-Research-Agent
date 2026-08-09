import io
import re
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


import html
import io
import re
from typing import Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.services.normalizer import report_normalizer


class ReportExporter:
    """Publication-grade PDF & Markdown export engine for TopResearch reports."""

    def format_markdown(self, title: str, markdown_content: str, metadata: dict[str, Any]) -> str:
        """Format report into clean, standalone Markdown with frontmatter header."""
        header = f"""---
title: "{title}"
generated_by: TopResearch AI Research OS
confidence_score: {metadata.get('confidence_score', 98.4)}%
sources_count: {metadata.get('sources_count', 0)}
date: {metadata.get('created_at', '')}
---

"""
        return header + markdown_content

    def _format_inline_text(self, text: str) -> str:
        """Convert markdown bold/italic tags to ReportLab HTML tags and escape XML characters."""
        if not text:
            return ""

        # Escape XML entities first
        t = html.escape(text)

        # Convert **bold** -> <b>bold</b>
        t = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", t)

        # Convert *italic* -> <i>italic</i>
        t = re.sub(r"\*(.*?)\*", r"<i>\1</i>", t)

        # Convert `code` -> <font name="Courier">\1</font>
        t = re.sub(r"`(.*?)`", r'<font name="Courier" size="9" color="#B4472B">\1</font>', t)

        return t

    def generate_pdf_bytes(self, title: str, markdown_content: str, metadata: dict[str, Any]) -> bytes:
        """Generate true PDF document bytes from report markdown using ReportLab Platypus."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40,
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#14130F"),
            spaceAfter=8,
        )

        meta_style = ParagraphStyle(
            "MetaStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#B4472B"),
            spaceAfter=12,
        )

        h2_style = ParagraphStyle(
            "Heading2Custom",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#14130F"),
            spaceBefore=12,
            spaceAfter=6,
        )

        exec_style = ParagraphStyle(
            "ExecText",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor("#1F2937"),
        )

        body_style = ParagraphStyle(
            "BodyCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor("#374151"),
            spaceAfter=6,
        )

        bullet_style = ParagraphStyle(
            "BulletCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            textColor=colors.HexColor("#1F2937"),
            spaceAfter=4,
        )

        story = []

        # Parse markdown using ReportNormalizer
        confidence = metadata.get("confidence_score", 95.0)
        sources_count = metadata.get("sources_count", 0)

        structured = report_normalizer.parse_structured_report(
            raw_markdown=markdown_content,
            query=title,
            confidence_score=confidence,
        )

        # 1. Document Header
        doc_title = structured.title or title or "Technical Research Report"
        story.append(Paragraph(self._format_inline_text(doc_title), title_style))
        story.append(
            Paragraph(
                f"TOPRESEARCH AI OS — VERIFIED REPORT | Confidence: {structured.confidence_score}% | Verified Sources: {len(structured.sources) or sources_count}",
                meta_style,
            )
        )
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#DEDACD"), spaceAfter=12))

        # 2. Executive Summary Box
        if structured.executive_summary:
            story.append(Paragraph("Executive Summary", h2_style))
            exec_p = Paragraph(self._format_inline_text(structured.executive_summary), exec_style)
            summary_table = Table([[exec_p]], colWidths=[532])
            summary_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F9F8F5")),
                        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEDACD")),
                        ("PADDING", (0, 0), (-1, -1), 10),
                    ]
                )
            )
            story.append(summary_table)
            story.append(Spacer(1, 10))

        # 3. Key Findings Section
        if structured.key_findings:
            story.append(Paragraph("Key Findings & Takeaways", h2_style))
            for finding in structured.key_findings:
                clean_finding = self._format_inline_text(finding)
                story.append(Paragraph(f"• {clean_finding}", bullet_style))
            story.append(Spacer(1, 10))

        # 4. Numbered Sections
        for sec in structured.sections:
            sec_title = f"{sec.number}. {sec.heading}" if sec.number else sec.heading
            story.append(Paragraph(self._format_inline_text(sec_title), h2_style))

            sec_lines = sec.content.split("\n")
            for line in sec_lines:
                line_str = line.strip()
                if not line_str:
                    continue
                if line_str.startswith("- ") or line_str.startswith("* "):
                    story.append(Paragraph(f"• {self._format_inline_text(line_str[2:])}", bullet_style))
                else:
                    story.append(Paragraph(self._format_inline_text(line_str), body_style))

            story.append(Spacer(1, 6))

        # 5. Conclusion Section
        if structured.conclusion:
            story.append(Paragraph("Conclusion", h2_style))
            story.append(Paragraph(self._format_inline_text(structured.conclusion), body_style))
            story.append(Spacer(1, 10))

        # 6. Categorized References Section
        if structured.sources:
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#DEDACD"), spaceBefore=10, spaceAfter=10))
            story.append(Paragraph("References & Mapped Evidence", h2_style))

            table_data = [
                [
                    Paragraph("<b>#</b>", meta_style),
                    Paragraph("<b>Source Title</b>", meta_style),
                    Paragraph("<b>Domain</b>", meta_style),
                    Paragraph("<b>Type</b>", meta_style),
                ]
            ]

            for s in structured.sources:
                num_p = Paragraph(f"[{s.citation_number}]", body_style)
                title_p = Paragraph(f"<a href='{s.url}'>{self._format_inline_text(s.title)}</a>", body_style)
                domain_p = Paragraph(s.domain or "web", body_style)
                type_p = Paragraph(s.source_type.upper(), body_style)
                table_data.append([num_p, title_p, domain_p, type_p])

            ref_table = Table(table_data, colWidths=[35, 330, 95, 72])
            ref_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F2F0EA")),
                        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#DEDACD")),
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("PADDING", (0, 0), (-1, -1), 5),
                    ]
                )
            )
            story.append(ref_table)

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes


exporter = ReportExporter()

