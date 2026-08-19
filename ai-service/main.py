from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import time
import json
import os
import asyncpg
from typing import List, Optional

app = FastAPI(title="Gradture AI Service")

model = SentenceTransformer("all-MiniLM-L6-v2")

DATABASE_URL = os.getenv("DATABASE_URL")

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
job_data = {}
db_pool = None


async def get_db_pool():
    global db_pool
    if db_pool is None and DATABASE_URL:
        try:
            db_pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
        except Exception as exc:
            print(f"Failed to create database pool: {exc}")
    return db_pool


async def load_jobs_from_db():
    global job_embeddings, job_ids, job_data
    pool = await get_db_pool()
    if not pool:
        return

    try:
        rows = await pool.fetch(
            """
            SELECT id, title, description, type, company, requiredSkills
            FROM jobs
            WHERE status = 'PUBLISHED'
            """
        )
        if rows:
            job_ids = [str(row["id"]) for row in rows]
            job_data = {
                str(row["id"]): {
                    "title": row["title"],
                    "description": row["description"] or "",
                    "type": row["type"],
                    "company": row["company"],
                    "requiredSkills": row["requiredSkills"] or [],
                }
                for row in rows
            }
            texts = [f"{row['title']}: {row['description'] or ''}" for row in rows]
            job_embeddings = model.encode(texts, convert_to_numpy=True)
    except Exception as exc:
        print(f"Failed to load jobs from database: {exc}")


def warm_up_embeddings():
    global job_embeddings, job_ids
    if job_embeddings is not None:
        return
    if not job_ids:
        texts = [f"{JOB_TITLES[jid]}: {JOB_DESCRIPTIONS[jid]}" for jid in JOB_DESCRIPTIONS]
        job_embeddings = model.encode(texts, convert_to_numpy=True)
        job_ids = list(JOB_DESCRIPTIONS.keys())


@app.on_event("startup")
async def startup():
    if DATABASE_URL:
        await get_db_pool()
        await load_jobs_from_db()
    warm_up_embeddings()


@app.on_event("shutdown")
async def shutdown():
    global db_pool
    if db_pool:
        await db_pool.close()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


class RecommendRequest(BaseModel):
    focus: str
    top_k: int = 5
    profile: Optional[dict] = None
    fallback: bool = False


class EmbedRequest(BaseModel):
    text: str


class MatchRequest(BaseModel):
    query: str
    candidates: List[str]


class NormalizeJobRequest(BaseModel):
    prompt: str


@app.post("/normalize-job")
def normalize_job(payload: NormalizeJobRequest) -> dict:
    return {
        "status": "fallback",
        "message": "AI normalization is not configured. Use provider normalization.",
    }


@app.post("/recommendations")
def get_recommendations(payload: RecommendRequest) -> dict:
    warm_up_embeddings()
    if not payload.focus or not isinstance(payload.focus, str):
        return {"recommendations": [], "error": "Invalid focus text"}

    profile_skills = []
    profile_education = ""
    profile_experience = ""
    if payload.profile:
        profile_skills = [s.lower() for s in payload.profile.get("skills", []) if isinstance(s, str)]
        edu = payload.profile.get("education")
        if isinstance(edu, dict):
            profile_education = f"{edu.get('institution', '')} {edu.get('degree', '')} {edu.get('fieldOfStudy', '')}".lower()
        exp = payload.profile.get("experience")
        if isinstance(exp, dict):
            profile_experience = f"{exp.get('jobTitle', '')} {exp.get('company', '')}".lower()

    try:
        query_text = payload.focus
        if payload.profile:
            focus = payload.profile.get("focus", "")
            summary = payload.profile.get("summary", "")
            skills_text = " ".join(payload.profile.get("skills", []))
            query_text = f"{focus} {summary} {skills_text}".strip() or payload.focus

        query_embedding = model.encode(query_text, convert_to_numpy=True)
        scores = cosine_similarity([query_embedding], job_embeddings)[0]
        ranked = sorted(zip(job_ids, scores), key=lambda x: x[1], reverse=True)[: payload.top_k]
        results = []
        for jid, score in ranked:
            if jid in job_data:
                job = job_data[jid]
                rec_text = f"{job['title']} {job.get('description', '')} {job.get('company', '')}".lower()
                match_reasons = []
                matched_skills = []
                matched_education = []
                matched_experience = []

                for skill in profile_skills:
                    if skill in rec_text:
                        matched_skills.append(skill)
                        match_reasons.append(f"Skill match: {skill}")

                if profile_education and any(part in rec_text for part in profile_education.split() if len(part) > 3):
                    matched_education.append(profile_education[:100])
                    match_reasons.append("Education background match")

                if profile_experience and any(part in rec_text for part in profile_experience.split() if len(part) > 3):
                    matched_experience.append(profile_experience[:100])
                    match_reasons.append("Experience background match")

                results.append(
                    {
                        "id": jid,
                        "title": job["title"],
                        "type": job["type"],
                        "score": round(float(score), 4),
                        "description": job.get("description", ""),
                        "company": job.get("company", ""),
                        "location": "",
                        "matchReasons": match_reasons[:3],
                        "matchedSkills": matched_skills[:5],
                        "matchedEducation": matched_education[:2],
                        "matchedExperience": matched_experience[:2],
                    }
                )
            else:
                results.append(
                    {
                        "id": jid,
                        "title": JOB_TITLES.get(jid, jid),
                        "type": JOB_TYPES.get(jid, "HIRING"),
                        "score": round(float(score), 4),
                        "description": JOB_DESCRIPTIONS.get(jid, ""),
                    }
                )
        return {"recommendations": results}
    except Exception as exc:
        return {"recommendations": [], "error": str(exc)}


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