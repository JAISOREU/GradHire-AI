from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import time
import json
import os
from typing import List

app = FastAPI(title="Gradture AI Service")

model = SentenceTransformer("all-MiniLM-L6-v2")

JOB_DESCRIPTIONS = {
    "1": "Join our internship program to build real-world software engineering skills.",
    "2": "Analyze business data and deliver actionable insights to stakeholders.",
    "3": "Shape product experiences through user research and visual design.",
    "4": "Work at the intersection of AI and product to ship impactful features.",
    "5": "Build and scale full-stack products in a fast-moving team.",
}

JOB_TITLES = {
    "1": "Software Engineer Intern",
    "2": "Data Analyst",
    "3": "Product Designer",
    "4": "AI Product Engineer",
    "5": "Full-Stack Developer",
}

JOB_TYPES = {
    "1": "INTERNSHIP",
    "2": "HIRING",
    "3": "HIRING",
    "4": "HIRING",
    "5": "HIRING",
}

job_embeddings = None
job_ids = []


def warm_up_embeddings():
    global job_embeddings, job_ids
    if job_embeddings is not None:
        return
    texts = [f"{JOB_TITLES[jid]}: {JOB_DESCRIPTIONS[jid]}" for jid in JOB_DESCRIPTIONS]
    job_embeddings = model.encode(texts, convert_to_numpy=True)
    job_ids = list(JOB_DESCRIPTIONS.keys())


@app.on_event("startup")
async def startup():
    warm_up_embeddings()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


class RecommendRequest(BaseModel):
    focus: str
    top_k: int = 5


class EmbedRequest(BaseModel):
    text: str


class MatchRequest(BaseModel):
    query: str
    candidates: List[str]


@app.post("/recommendations")
def get_recommendations(payload: RecommendRequest) -> dict:
    warm_up_embeddings()
    query_embedding = model.encode(payload.focus, convert_to_numpy=True)
    scores = cosine_similarity([query_embedding], job_embeddings)[0]
    ranked = sorted(zip(job_ids, scores), key=lambda x: x[1], reverse=True)[: payload.top_k]
    results = []
    for jid, score in ranked:
        results.append(
            {
                "id": jid,
                "title": JOB_TITLES[jid],
                "type": JOB_TYPES[jid],
                "score": round(float(score), 4),
                "description": JOB_DESCRIPTIONS[jid],
            }
        )
    return {"recommendations": results}


@app.post("/embed")
def embed_text(payload: EmbedRequest) -> dict:
    vector = model.encode(payload.text, convert_to_numpy=True)
    return {"embedding": vector.tolist()}


@app.post("/match")
def match_text(payload: MatchRequest) -> dict:
    query_emb = model.encode(payload.query, convert_to_numpy=True)
    candidate_embs = model.encode(payload.candidates, convert_to_numpy=True)
    scores = cosine_similarity([query_emb], candidate_embs)[0]
    ranked = sorted(enumerate(scores), key=lambda x: x[1], reverse=True)
    results = [{"index": int(i), "score": round(float(s), 4)} for i, s in ranked]
    return {"matches": results}


@app.get("/metrics")
def get_metrics() -> dict:
    metrics_path = "/app/metrics.json"
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    return {
        "precision_at_k": {},
        "recall_at_k": {},
        "avg_latency_ms": 0,
        "total_requests": 0,
    }
