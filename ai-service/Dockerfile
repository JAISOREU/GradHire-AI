FROM python:3.12-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev
RUN pip install --no-cache-dir --prefix=/install --index-url https://download.pytorch.org/whl/cpu torch==2.5.1
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.12-slim
WORKDIR /app
RUN addgroup --system --gid 1001 appgroup && adduser --system --uid 1001 --ingroup appgroup appuser
COPY --from=builder /install /usr/local
COPY main.py .
RUN chown -R appuser:appgroup /usr/local/lib/python3.12/site-packages /app
USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
