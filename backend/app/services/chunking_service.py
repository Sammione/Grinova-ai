from typing import List, Dict, Any
from app.services.document_service import DocumentElement

class ChunkedDocument:
    def __init__(self, text: str, page_number: int, metadata: Dict[str, Any]):
        self.text = text
        self.page_number = page_number
        self.metadata = metadata

class ChunkingService:
    @staticmethod
    def create_semantic_chunks(elements: List[DocumentElement], source: str) -> List[ChunkedDocument]:
        """
        Stage 4: Semantic Chunking
        Splits documents by meaning, not page size. Maintains section hierarchy.
        Stores title, subheading, page number, paragraph, table, source.
        """
        chunks = []
        current_chunk_text = ""
        current_title = "Unknown"
        current_subheading = "Unknown"
        current_page = 1
        
        # Simple heuristic: Titles and subheadings define new sections
        for element in elements:
            if element.element_type == 'Title':
                # Save previous chunk if exists
                if current_chunk_text.strip():
                    chunks.append(ChunkedDocument(
                        text=current_chunk_text.strip(),
                        page_number=current_page,
                        metadata={
                            "title": current_title,
                            "subheading": current_subheading,
                            "source": source,
                            "type": "paragraph"
                        }
                    ))
                    current_chunk_text = ""
                current_title = element.text
                current_subheading = "Unknown" # Reset subheading
                current_page = element.page_number
                
            elif element.element_type == 'Table':
                # Tables are their own chunks usually, as they have high semantic value independently
                if current_chunk_text.strip():
                    chunks.append(ChunkedDocument(
                        text=current_chunk_text.strip(),
                        page_number=current_page,
                        metadata={
                            "title": current_title,
                            "subheading": current_subheading,
                            "source": source,
                            "type": "paragraph"
                        }
                    ))
                    current_chunk_text = ""
                
                table_text = element.metadata.get("text_as_html", element.text)
                chunks.append(ChunkedDocument(
                    text=table_text,
                    page_number=element.page_number,
                    metadata={
                        "title": current_title,
                        "subheading": current_subheading,
                        "source": source,
                        "type": "table"
                    }
                ))
            else:
                # Accumulate narrative text
                if not current_chunk_text:
                    current_page = element.page_number
                current_chunk_text += element.text + "\n"
                
                # If chunk gets too large (e.g. > 1500 chars), we might split it, but "semantic chunking"
                # prefers to keep logical sections together. Let's rely on LLM context windows being large enough,
                # or split on double newlines.
                if len(current_chunk_text) > 2000:
                    chunks.append(ChunkedDocument(
                        text=current_chunk_text.strip(),
                        page_number=current_page,
                        metadata={
                            "title": current_title,
                            "subheading": current_subheading,
                            "source": source,
                            "type": "paragraph"
                        }
                    ))
                    current_chunk_text = ""
                    
        # Add remaining text
        if current_chunk_text.strip():
            chunks.append(ChunkedDocument(
                text=current_chunk_text.strip(),
                page_number=current_page,
                metadata={
                    "title": current_title,
                    "subheading": current_subheading,
                    "source": source,
                    "type": "paragraph"
                }
            ))
            
        return chunks

chunking_service = ChunkingService()
