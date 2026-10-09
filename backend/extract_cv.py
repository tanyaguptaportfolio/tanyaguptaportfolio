import argparse
import json
from pathlib import Path

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph


def extract_document(path: Path) -> dict[str, str | list[str]]:
    document = Document(path)
    blocks: list[str] = []
    for block in document.iter_inner_content():
        if isinstance(block, Paragraph) and block.text.strip():
            blocks.append(block.text.strip())
        elif isinstance(block, Table):
            for row in block.rows:
                text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if text:
                    blocks.append(text)
    for section in document.sections:
        for area in (section.header, section.footer):
            blocks.extend(paragraph.text.strip() for paragraph in area.paragraphs if paragraph.text)
    return {"source": path.name, "paragraphs": blocks}


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract CV text for manual fact verification")
    parser.add_argument("documents", type=Path, nargs="+")
    arguments = parser.parse_args()
    for path in arguments.documents:
        if not path.is_file() or path.suffix.lower() != ".docx":
            parser.error(f"Expected an existing DOCX document: {path}")
    print(json.dumps([extract_document(path) for path in arguments.documents], indent=2))


if __name__ == "__main__":
    main()
