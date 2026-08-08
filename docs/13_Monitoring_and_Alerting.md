# Monitoring and Alerting Runbook

## Overview
This runbook covers monitoring, alerting, and incident response for the GradHire AI platform.

## Metrics

### Application Metrics (Prometheus)
The backend exposes Prometheus metrics at `GET /metrics`.

Key metrics:
- `http_requests_total` — total HTTP requests by method, route, and status code
- `http_request_duration_seconds` — request latency histogram
- `active_connections` — current active connections
- `nodejs_heap_size_used_bytes` — Node.js heap usage
- `nodejs_event_loop_lag_seconds` — event loop lag

### Health Check
- `GET /health` — returns service status and database connectivity check
- Expected response: `{"status":"healthy","service":"gradture-backend","version":"0.1.0","checks":{"database":{"status":"up","latencyMs":X}}}`

## Recommended Monitoring Stack

### Infrastructure
- **Prometheus** — scrape metrics from backend `/metrics` endpoint
- **Grafana** — dashboards for application and infrastructure metrics
- **Alertmanager** — route alerts to Slack, email, or PagerDuty

### Key Alerts

| Alert | Condition | Severity |
|-------|-----------|----------|
| Backend down | `/health` returns `status: "unhealthy"` for 2 minutes | Critical |
| High error rate | `http_requests_total{status_code=~"5.."}` > 5/min | Warning |
| Slow responses | `http_request_duration_seconds` p95 > 1s | Warning |
| Database down | `/health` database check returns `status: "down"` | Critical |
| High memory | `nodejs_heap_size_used_bytes` > 512MB | Warning |

## Logging

### Structured Logging
The backend uses `pino` for structured JSON logging. Logs include:
- `correlationId` — request tracing ID
- `method`, `url`, `status`, `duration` — request details
- `level` — log level (info, warn, error)

### Log Aggregation
For production, ship logs to:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Loki + Grafana**
- **Datadog** / **New Relic**

## Incident Response

### Severity Levels
- **P0 (Critical)** — complete service outage, data loss risk
- **P1 (High)** — major feature broken, significant user impact
- **P2 (Medium)** — minor feature broken, workaround available
- **P3 (Low)** — cosmetic issue, no user impact

### Response Procedure
1. Acknowledge alert within SLA (P0: 15min, P1: 30min, P2: 2h, P3: 24h)
2. Check Grafana dashboards for system-wide impact
3. Check backend logs for errors
4. If database issue: check Postgres container health, run `docker-compose ps`
5. If application issue: check recent deployments, consider rollback
6. Update status page if user-facing impact
7. Post-incident review for P0/P1 incidents

### Rollback Procedure
1. Go to GitHub Actions → CD workflow
2. Click "Run workflow"
3. Select "Rollback Production"
4. Enter the previous image tag (e.g., `main-abc1234`)
5. Monitor health check and metrics after deployment

## Backup and Recovery

### Database Backups
- Automated daily backups via `scripts/backup.sh`
- Retention: 7 days (configurable via `RETENTION_DAYS`)
- Storage: local filesystem (extend to S3 for production)

### Restore Procedure
1. Stop backend service
2. Run `scripts/restore.sh <backup-file.sql.gz>`
3. Verify data integrity
4. Restart backend service
5. Run health check to confirm recovery
