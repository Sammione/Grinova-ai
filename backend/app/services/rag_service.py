import os
from typing import List, Dict, Any
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document as LangchainDocument
from app.core.config import settings
from app.services.chunking_service import ChunkedDocument

class RAGService:
    def __init__(self):
        self.persist_directory = "db/chroma"
        self.vector_store = None
        self.embeddings = None

    def _init_vector_store(self):
        if self.vector_store is not None:
            return

        try:
            if not os.path.exists(self.persist_directory):
                os.makedirs(self.persist_directory)
            
            self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
            self.vector_store = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embeddings,
                collection_name="sustainability_docs"
            )
        except Exception as e:
            import traceback
            traceback.print_exc()
            self._last_init_error = str(e)
            print(f"Warning: Failed to initialize Vector Store. Is OPENAI_API_KEY valid? Error: {e}")

    async def add_chunks(self, chunks: List[ChunkedDocument]):
        """
        Takes semantically chunked documents and adds them to Chroma DB.
        """
        self._init_vector_store()
        if self.vector_store is None:
            error_msg = getattr(self, "_last_init_error", "Unknown Error")
            raise ValueError(f"Vector store not initialized. Init Error: {error_msg}")
            
        docs = []
        for chunk in chunks:
            metadata = chunk.metadata.copy()
            metadata["page_number"] = chunk.page_number
            docs.append(LangchainDocument(page_content=chunk.text, metadata=metadata))
            
        self.vector_store.add_documents(docs)

    async def query(self, query: str, k: int = 4) -> List[Dict[str, Any]]:
        """
        Stage 5: RAG Search
        Uses semantic search to find evidence. Returns evidence WITH page number and context.
        """
        self._init_vector_store()
        if self.vector_store is None:
            return []
            
        results = self.vector_store.similarity_search_with_relevance_scores(
            query, 
            k=k
        )
        
        # results is a list of tuples (Document, score)
        formatted_results = []
        for doc, score in results:
            formatted_results.append({
                "content": doc.page_content,
                "metadata": doc.metadata,
                "score": score
            })
            
        return formatted_results

rag_service = RAGService()
