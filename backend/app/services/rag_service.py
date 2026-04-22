import os
from typing import List
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings

class RAGService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.OPENAI_API_KEY)
        self.persist_directory = "db/chroma"
        self._init_vector_store()

    def _init_vector_store(self):
        if not os.path.exists(self.persist_directory):
            os.makedirs(self.persist_directory)
        
        self.vector_store = Chroma(
            persist_directory=self.persist_directory,
            embedding_function=self.embeddings,
            collection_name="sustainability_docs"
        )

    async def add_documents(self, texts: List[str], metadatas: List[dict] = None):
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
        docs = text_splitter.create_documents(texts, metadatas=metadatas)
        self.vector_store.add_documents(docs)
        self.vector_store.persist()

    async def query(self, query: str, framework_id: str = None, k: int = 4) -> str:
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
