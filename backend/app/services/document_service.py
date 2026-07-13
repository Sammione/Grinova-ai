import os
from typing import List, Dict, Any
from unstructured.partition.auto import partition
from unstructured.documents.elements import Table, Title, NarrativeText, ListItem, Footer, Header

class DocumentElement:
    def __init__(self, element_type: str, text: str, page_number: int, metadata: Dict[str, Any] = None):
        self.element_type = element_type
        self.text = text
        self.page_number = page_number
        self.metadata = metadata or {}
        
    def to_dict(self):
        return {
            "type": self.element_type,
            "text": self.text,
            "page_number": self.page_number,
            "metadata": self.metadata
        }

class DocumentService:
    @staticmethod
    def process_document(file_path: str, filename: str) -> List[DocumentElement]:
        """
        Stage 1: Intelligent Document Processing
        Extracts text, tables, charts, images, footnotes, page numbers, and metadata.
        Handles scanned PDFs, OCR, multi-column layouts, etc. using unstructured.
        """
        elements = partition(filename=file_path, strategy="hi_res", pdf_infer_table_structure=True)
        
        doc_elements = []
        for element in elements:
            # Skip headers and footers to reduce noise, though we could keep them if needed
            if isinstance(element, (Header, Footer)):
                continue
                
            element_type = type(element).__name__
            text = str(element)
            
            if not text.strip():
                continue
                
            page_number = 1
            if hasattr(element, "metadata") and element.metadata and element.metadata.page_number:
                page_number = element.metadata.page_number
                
            # Store table HTML if it's a table
            metadata = {}
            if isinstance(element, Table) and hasattr(element.metadata, 'text_as_html'):
                metadata["text_as_html"] = element.metadata.text_as_html

            doc_elements.append(DocumentElement(
                element_type=element_type,
                text=text,
                page_number=page_number,
                metadata=metadata
            ))
            
        return doc_elements

document_service = DocumentService()
