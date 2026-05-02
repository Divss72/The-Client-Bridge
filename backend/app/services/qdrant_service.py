from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.core.config import settings
import uuid

# Initialize Qdrant Client - using local memory mode for easy demo without Docker
qclient = QdrantClient(location=":memory:")

COLLECTION_NAME = "crm_memories"

def init_qdrant():
    collections = qclient.get_collections()
    collection_names = [c.name for c in collections.collections]
    
    if COLLECTION_NAME not in collection_names:
        qclient.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=qmodels.VectorParams(size=1536, distance=qmodels.Distance.COSINE), # OpenAI text-embedding-3-small uses 1536
        )
        print(f"Created Qdrant collection: {COLLECTION_NAME}")

init_qdrant()

def store_memory(client_id: int, text: str, source_type: str, embedding: list, sentiment: str = "neutral"):
    point_id = str(uuid.uuid4())
    payload = {
        "client_id": client_id,
        "text": text,
        "source_type": source_type,
        "sentiment": sentiment
    }
    
    qclient.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            qmodels.PointStruct(
                id=point_id,
                vector=embedding,
                payload=payload
            )
        ]
    )
    return point_id

def search_memories(client_id: int, query_embedding: list, limit: int = 5):
    search_result = qclient.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_embedding,
        query_filter=qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="client_id",
                    match=qmodels.MatchValue(value=client_id)
                )
            ]
        ) if client_id else None,
        limit=limit
    )
    
    results = [
        {
            "id": hit.id,
            "score": hit.score,
            "text": hit.payload.get("text"),
            "source_type": hit.payload.get("source_type"),
            "sentiment": hit.payload.get("sentiment"),
            "client_id": hit.payload.get("client_id")
        } for hit in search_result
    ]
    return results
