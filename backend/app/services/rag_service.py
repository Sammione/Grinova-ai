import os
from typing import List
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings

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
            print(f"Warning: Failed to initialize Vector Store. Is OPENAI_API_KEY valid? Error: {e}")

    async def add_documents(self, texts: List[str], metadatas: List[dict] = None):
        self._init_vector_store()
        if not self.vector_store:
            raise ValueError("Vector store not initialized. Check OpenAI API key.")
            
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
        docs = text_splitter.create_documents(texts, metadatas=metadatas)
        self.vector_store.add_documents(docs)
        self.vector_store.persist()

    async def query(self, query: str, framework_id: str = None, k: int = 4) -> str:
        self._init_vector_store()
        if not self.vector_store:
            return "Knowledge base not available. Please configure OpenAI API key."
            
        filter_dict = {}
        if framework_id:
            filter_dict["framework_id"] = framework_id
            
        results = self.vector_store.similarity_search(
            query, 
            k=k,
            filter=filter_dict if filter_dict else None
        )
        
        return "\n\n".join([doc.page_content for doc in results])

rag_service = RAGService()
