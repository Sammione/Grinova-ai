# Grinova AI: Architecture & Workflow

The Grinova AI application is designed to be an **ESG (Environmental, Social, and Governance) and Sustainability Intelligence Platform**. Its primary goal is to help organizations manage, evaluate, and generate their sustainability reports (like GRI or SASB) using AI.

Here is a high-level breakdown of how the application is supposed to work from end to end:

## 1. Data Ingestion & RAG (Retrieval-Augmented Generation)
*   **Action:** A user goes to the "Intelligence Hub" on the frontend and uploads company documents (PDFs, Word docs, or Text files) containing sustainability data, policies, or financial reports.
*   **Behind the scenes:** The FastAPI backend receives the file and uses the `document_service.py` to extract the raw text. It then passes this text to the `rag_service.py`, which uses **Langchain** and **OpenAI Embeddings** to chunk the text and store it in a local **Chroma** vector database. This essentially creates a highly searchable "knowledge base" of the company's specific data.

## 2. AI Assessment & Scoring
*   **Action:** The system evaluates the uploaded data against established sustainability frameworks (like GRI, SASB, or UN SDGs).
*   **Behind the scenes:** The `scoring_engine.py` calculates an **ESG Readiness Index** (an overall score out of 100) and provides a breakdown across categories like Environmental, Social, Governance, Carbon Footprint, and Supply Chain. This score is saved in the SQLite database (`ScoreHistory` table) so the company can track its progression over different quarters.

## 3. The Dashboard Experience
*   **Action:** The user navigates to the main Dashboard or the Scoring page.
*   **Behind the scenes:** The frontend (Next.js) fetches the latest data from the backend. The user sees:
    *   Their current overall **Readiness Score** and Risk Level.
    *   A **Radar Chart** showing where they excel and where they lag (e.g., strong in Governance, weak in Supply Chain).
    *   A **Score Progression Chart** showing how their score has improved over time.
    *   An **AI Intelligence Panel** that highlights actionable insights—for example, it might flash a warning that "Scope 3 emissions data for Q2 is missing" or highlight a "Performance Peak" in renewable energy usage.

## 4. AI Chat & Report Generation
*   **Action:** The user asks the AI assistant a question (e.g., *"Are we compliant with SASB governance standards?"*) or asks it to generate a report section.
*   **Behind the scenes:** The `ai_service.py` takes the user's query, searches the Chroma vector database to find the relevant context from the previously uploaded documents, and sends a highly specific prompt to OpenAI's `gpt-4-turbo-preview` model. The AI returns a professional, framework-compliant answer or a drafted report section based *strictly* on the company's real data.

## Summary Workflow
1. **Upload Documents**
2. **AI Indexes Data**
3. **System Calculates ESG Score**
4. **Dashboard Displays Insights & Risks**
5. **User interacts with AI Chat to write the final Sustainability Report.**
