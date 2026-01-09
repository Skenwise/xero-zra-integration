# VSDC Integration Module — Design Document

**Purpose:**
Provide a modular, testable, production-ready design for a VSDC (ZRA) integration module. This module exposes internal endpoints for the POS/Xero → VSDC flow, handles device initialization, payload mapping, queuing, retries, persistence, and monitoring.

---

## Overview

* Language: **Python 3.10+**
* Framework: **FastAPI** for HTTP endpoints (internal API).
* HTTP client: **requests** (or httpx if async desired).
* DB: existing app DB (SQLite/Postgres) via **SQLAlchemy** (ORM) or direct sqlite3 for small setup.
* Background jobs / scheduler: **Celery** or a simple in-process scheduler (APScheduler) for retries and offline sync.
* Config: `YAML` + `.env` (use `python-dotenv`).

---

## High-level Components

1. **vsdc_client** — HTTP client wrapper for VSDC endpoints and device init.
2. **mapper** — Mapping logic from internal invoice model (Xero/POS) → VSDC payload (TrnsSalesSaveWrReq).
3. **service** — Business logic: `send_sale`, `queue_sale`, `process_queue`, `init_device`, `get_status`.
4. **api** — FastAPI endpoints used by frontend/other services.
5. **models (ORM)** — DB models for `Device`, `VSDSentRequest`, `VSDResponse`, `QueuedSale`, `InvoiceMapping`.
6. **tasks** — Background workers for retries and sync.
7. **utils** — helpers: date format, numeric normalization, idempotency key generation, logging.
8. **tests** — unit & integration tests.

## Folder Layout

```
vsdc_integration/
├─ __init__.py
├─ config.py                # loads YAML + .env
├─ vsdc_client.py           # low-level HTTP wrapper
├─ mapper.py                # mapping functions
├─ service.py               # core business logic
├─ api.py                   # FastAPI endpoints
├─ models.py                # SQLAlchemy models + migrations
├─ tasks.py                 # background tasks (Celery/APS)
├─ queue_manager.py         # queue abstraction (DB-backed)
├─ utils.py                 # helpers
├─ schemas.py               # Pydantic schemas for API
├─ tests/
│  ├─ test_mapper.py
│  ├─ test_service.py
│  └─ test_integration.py
└─ README.md
```

---

## Configuration (config.py)

* Load from `config/default.yaml` (example values) and override with `.env`.
* Key config values:

  * `VSDC_BASE_URL`
  * `DEVICE_INIT_ENDPOINT` (e.g. `/initializer/selectInitInfo`)
  * `SEND_SALE_ENDPOINT` (e.g. `/trnsSales/saveSales`)
  * `RETRY_POLICY` (max_attempts, backoff)
  * `DB_URL` (SQLAlchemy connection)

Example `default.yaml` snippet:

```yaml
vsdc:
  base_url: "https://vsdc-test.example"
  endpoints:
    init: "/initializer/selectInitInfo"
    send_sale: "/trnsSales/saveSales"
retry:
  max_attempts: 5
  base_backoff_seconds: 10
```

---

## Database Models (models.py)

Use SQLAlchemy declarative models.

### Device

```py
class Device(Base):
    __tablename__ = 'vsdc_device'
    id = Column(Integer, primary_key=True)
    tpin = Column(String, nullable=False)
    bhf_id = Column(String, nullable=False)
    dvc_srl_no = Column(String)
    intrl_key = Column(String)
    sign_key = Column(String)
    cmc_key = Column(String)
    dvc_id = Column(String)
    sdc_id = Column(String)
    mrc_no = Column(String)
    initialized_at = Column(DateTime)
```

### VSDSentRequest

```py
class VSDSentRequest(Base):
    __tablename__ = 'vsdc_sent'
    id = Column(Integer, primary_key=True)
    invoice_id = Column(String, nullable=False)  # app invoice id
    invc_no = Column(String)
    tpin = Column(String)
    bhf_id = Column(String)
    payload = Column(JSON)
    response = Column(JSON)
    status = Column(String)  # queued, sent, acked, failed
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime, default=now)
    updated_at = Column(DateTime)
    idempotency_key = Column(String, unique=True)
```

### QueuedSale

(use same as VSDSentRequest, can reuse)

---

## vsdc_client.py (design)

* Class `VSDCClient(base_url, device_keys=None, timeout=10)`

  * `_headers()` -> builds headers using device keys
  * `post(path, payload)` -> low-level POST with error handling and logging
  * `initialize_device(tpin, bhfId, dvcSrlNo)` -> calls init endpoint; returns parsed keys
  * `send_sale(payload)` -> calls send_sale endpoint; returns JSON
  * Consider both **sync** and **async** variants (httpx) — pick one strategy.

Errors: raise custom exceptions (`VSDCNetworkError`, `VSDCApiError`) capturing `resultCd`.

---

## mapper.py (design)

* Purpose: transform internal invoice object to VSDC `TrnsSalesSaveWrReq` dict.
* API:

  * `map_invoice_to_vsdc(invoice: InvoiceModel, device: Device) -> dict`
  * `map_item_to_vsdc(item: InvoiceItem) -> dict`

Rules:

* Ensure date formats: `salesDt` → `YYYYMMDD`, `stockRlsDt`/`cfmDt` → `YYYYMMDDhhmmss` if required
* Numeric normalization: two decimals, no thousand separators
* Missing customer TPIN: use `custNm` or empty fields as spec
* Generate `itemSeq` from line index
* Compute totals (taxblAmt, taxAmt) server-side and assert against invoice totals
* Generate `idempotency_key` = `sha256(f"{invoice.id}|{device.bhf_id}|{device.tpin}")`

Example mapping output snippet (short):

```json
{
  "tpin": "...",
  "bhfId": "...",
  "invcNo": 12345,
  "salesDt": "20251027",
  "totItemCnt": 3,
  "totTaxblAmt": 1000.00,
  "taxAmt": 160.00,
  "totAmt": 1160.00,
  "itemList": [ {"itemSeq":1, "itemCd":"SKU-1", "qty":1, "prc":1000.0, "taxblAmt":1000.0, "taxAmt":160.0, "totAmt":1160.0} ]
}
```

---

## service.py (design)

Responsibilities:

* `init_device(tpin, bhf_id, dvc_srl_no)` -> calls client.initialize_device and persists Device record
* `send_sale(invoice_id)` -> orchestrates mapping, idempotency check, persist VSDSentRequest with status queued/sent, call client.send_sale, handle response
* `queue_sale(invoice_id)` -> insert VSDSentRequest with status=queued
* `process_queue(limit=100)` -> fetch queued entries and attempt to send with retry/backoff logic
* `handle_response(vsd_request, resp_json)` -> update status, save response fields (rcptNo, intrlData, rcptSign, sdcId, mrcNo)
* `get_status(invoice_id)` -> query VSDSentRequest

Flow for `send_sale`:

1. Check if VSDSentRequest exists by idempotency_key; if exists and status acked -> return existing
2. Map invoice -> payload
3. Persist new VSDSentRequest (status=sent, attempts=1)
4. Call `client.send_sale(payload)`
5. If `resultCd` == success -> handle_response -> status=acked
6. Else -> status=failed, schedule retry

---

## API Endpoints (api.py)

Use FastAPI with Pydantic schemas.

### `POST /vsdc/init`

Request: `{ tpin, bhfId, dvcSrlNo }`
Action: call service.init_device -> returns device object (mask keys)
Auth: admin

### `POST /vsdc/send`

Request: internal invoice reference or full invoice payload
Body: `{ invoice_id: str }` or `InvoiceSchema`
Action: service.send_sale or queue if offline
Response: `{ status: queued|sent|acked, vsd_response: {...} }`

### `GET /vsdc/status/{invoice_id}`

Action: return send request status and stored response

### `GET /vsdc/queue` (admin)

List queued items, attempts, errors

---

## Queue & Retry Strategy

* Implement DB-backed queue (VSDSentRequest.status == 'queued')
* Exponential backoff: attempt n -> wait `base_backoff_seconds * (2 ** (n-1))`
* Max attempts defined in config; after that mark as `failed` and raise alert
* Use a background worker to run `process_queue()` periodically (Celery beat or APScheduler)

---

## Idempotency & Dedup

* Use `idempotency_key` generated deterministically from `invoice_id + bhfId + tpin`.
* Add unique constraint on `idempotency_key` in DB.
* When a send request is attempted twice, return stored response if already acked.

---

## Offline / Sync

* If VSDC unreachable -> set status=queued with `next_attempt_at` timestamp
* Background job retries queued items
* Provide admin UI or endpoint to force retry

---

## Security

* Store device keys encrypted at rest (use application secrets or KMS when available)
* Never log full keys
* Use TLS (https) for VSDC endpoints
* Limit API access with API keys / JWT for internal endpoints

---

## Logging & Monitoring

* Log full request/response JSON to DB (or to secure log store) with correlation id
* Track metrics: success rate, average latency, queue length
* Alert on repeated failures (Slack/email integration)

---

## Testing

* Unit tests for `mapper.py` with sample Xero invoices
* Mock `vsdc_client` for `service.py` tests
* Integration test against VSDC test environment (if available)

---

## Example Sequence Diagram (simplified)

```
Frontend / Xero   -> API (/vsdc/send) -> Service.send_sale -> Mapper -> VSDSentRequest(queued/sent) -> VSDCClient.send_sale -> VSDC -> response -> Service.handle_response -> DB
```

---

## Quick Start Checklist for Implementation

1. Create folder & config files
2. Implement models + alembic migrations
3. Implement vsdc_client and write tests mocking HTTP
4. Implement mapper with unit tests
5. Implement service logic and queue processing
6. Implement FastAPI endpoints
7. Add background worker (Celery/APS) and scheduler
8. Add monitoring & alerts

---

If you want, I can also generate **starter code templates** for specific files (`vsdc_client.py`, `mapper.py`, `models.py`, `service.py`, `api.py`) so you can copy-and-paste and start coding. Which files do you want first?
