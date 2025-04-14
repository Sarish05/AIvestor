// Simple in-memory document store for development
interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
}

// In-memory document store
let documents: Document[] = [];

// Add a document to the store
export const addDocument = async (
  content: string,
  metadata: Record<string, any> = {}
): Promise<string> => {
  const id = Date.now().toString();
  documents.push({
    id,
    content,
    metadata
  });
  return id;
};

// Simple search implementation (without embeddings)
export const searchDocuments = async (query: string, k: number = 5): Promise<Document[]> => {
  // Very basic search - just checks if the query terms are in the document
  const queryTerms = query.toLowerCase().split(/\s+/);
  
  // Score documents based on term frequency
  const scoredDocs = documents.map(doc => {
    const content = doc.content.toLowerCase();
    let score = 0;
    
    queryTerms.forEach(term => {
      // Count occurrences of the term in the document
      const regex = new RegExp(term, 'g');
      const matches = content.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    
    return { doc, score };
  });
  
  // Sort by score and take top k
  const topDocs = scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(item => item.doc);
    
  return topDocs;
};

// Get document by ID
export const getDocumentById = async (docId: string): Promise<Document | null> => {
  const doc = documents.find(d => d.id === docId);
  return doc || null;
};

// Delete document by ID
export const deleteDocumentById = async (docId: string): Promise<boolean> => {
  const initialLength = documents.length;
  documents = documents.filter(d => d.id !== docId);
  return documents.length < initialLength;
};

// Format documents as string (for use with AI)
export const formatDocumentsAsString = (docs: Document[]): string => {
  return docs.map(doc => doc.content).join("\n\n");
}; 